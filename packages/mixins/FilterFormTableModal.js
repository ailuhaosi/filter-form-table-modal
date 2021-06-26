/**
 * 此组件用于 过滤下方表格的表单----表格----弹窗(表单/提示)
 * 注意命名必须一致
 */

import CustomizeForm from "../components/CustomizeForm";
import CustomizeTable from "../components/CustomizeTable";

import { cloneDeep as local_cloneDeep } from "../utils";
import { mapKeysToTarget as local_mapKeysToTarget } from "../utils";

/**列出所有目前内建的表单item组件类型 */
const allBuildInFormItemTypes = [
  "Input",
  "Select",
  "CheckboxGroup",
  "RadioGroup",
  "Switch",
  "DatePicker",
  "TimePicker",
]; // CustomizeFormItem

export const cloneDeep = local_cloneDeep;
export const mapKeysToTarget = local_mapKeysToTarget;
////////////////////////////////
export const FilterFormTableModal = function(
  config = {
    checkBtnPermission: (that, key) => true,
  }
) {
  let { checkBtnPermission = (that, key) => true } = config;
  return {
    provide() {
      return { that: this };
    }, //使得 注册的组件 可以访问属性
    components: {
      FilterFormTableModalComponent: {
        name: "FilterFormTableModalComponent",
        components: {
          CustomizeForm,
          CustomizeTable,
        },
        inject: ["that"],
        template: `
                <div>
                <customize-form
                    ref="FormAboveTableRef"
                    class="form-above-table"
                    :class="that.mixins_formAboveTableLayout"
                    :is-dialog-container="false"
                    :form-common-attr="that.formCommonAttrAboveTable"
                    :footer-block-components="that.footerBlockComponentsAboveTable"
                    :form-item-meta-list="that.formItemMetaListAboveTable"
                    :form-data="that.formDataAboveTable"
                    @update:form-data="(val) => that.$set(that.$data, 'formDataAboveTable', val)"
                    @do-operation="that.mixins_doFormAboveTableEventStrategy(arguments)"
                />
                <customize-table
                    ref="TableRef"
                    :table-list-loading="false"
                    :table-col-meta-data="that.tableColMetaData"
                    :table-body-data="that.tableBodyData"
                    :table-common-attr="that.tableCommonAttr"
                    :page-obj="that.pageObj"
                    @update:table-body-data="(val) => that.$set(that.$data, 'tableBodyData', val)"
                    @update:page-obj="(val) => that.$set(that.$data, 'pageObj', val)"
                    @do-operation="that.mixins_doTableEventStrategy(arguments)"
                />
                <customize-form
                    ref="DialogFormRef"
                    class="form-modal"
                    :is-dialog-container="true"
                    :dialog-type="that.dialogType"
                    :dialog-form-visible="that.dialogFormVisible"
                    :dialog-center="true"
                    :form-common-attr="that.formCommonAttrModal"
                    :footer-block-components="that.footerBlockComponentsModal"
                    :form-item-meta-list="that.dialogFormItemMetaList"
                    :form-data="that.dialogFormData"
                    @update:dialog-form-visible="(val) => (that.dialogFormVisible = val)"
                    @update:form-data="(val) => that.$set(that.$data, 'dialogFormData', val)"
                    @do-operation="that.mixins_doDialogFormEventStrategy(arguments)"
                >
                    <template v-slot:dialogTitle>
                        <div style="font-weight: 550">{{ that.dialogFormTitle }}</div>
                    </template>
                </customize-form>
                </div>
                `,
      },
    },
    data() {
      return {
        /**
         * 表格上方的表单 相关数据开始
         * */
        formCommonAttrAboveTable: {
          "label-width": "120px", // 表单项的label宽继承
        },
        formAboveTableCanToggledShowStatusOverIdx: 4, //formItemMetaListAboveTable中索引>=4的统统隐藏
        footerBlockComponentsAboveTable: [],
        formDataAboveTable: {},
        /**
         * 表格上方的表单 相关数据结束
         * */
        // /////////////////////
        /**
         * 表格 相关数据开始
         * */
        tableBodyData: [],
        pageObj: {
          page: 1,
          limit: 10,
          total: 0,
        },
        // ///
        curPickedTableRowsData: [], // 表格多选项
        /**
         * 表格 相关数据结束
         * */
        // /////////////////////
        /**
         * 弹窗(表单) 相关数据开始
         */
        dialogType: "Form",
        dialogFormVisible: false,
        dialogFormTitle: "编辑",
        formCommonAttrModal: {
          "label-width": "120px",
        },
        // 弹窗表单 下面是两个按钮
        footerBlockComponentsModal: [
          {
            key: "form-cancel",
            type: "Button",
            componentAttr: {
              type: "info",
              plain: true,
              textVal: "取消",
            },
            events: (eventFromKey) => {
              return {
                click: () => {
                  this.mixins_emitEventStrategy(
                    "DialogForm",
                    "FormCancelThenClearDialogVisible",
                    eventFromKey
                  );
                },
              };
            },
            isShow: true,
          },
          {
            key: "form-ok",
            type: "Button",
            componentAttr: {
              type: "primary",
              textVal: "确定",
            },
            events: (...args) => {
              return {
                click: () => {
                  this.mixins_emitEventStrategy(
                    "DialogForm",
                    "ValidSubmit",
                    ...args
                  );
                },
              };
            },
          },
        ],
        dialogFormItemMetaList: [],
        dialogFormData: {},
        /**
         * 弹窗(表单/提示) 相关数据结束
         */
        // 其它
        curDialogInfo: {},
      };
    },
    computed: {
      /** //TODO:FIXME:formItemMetaListAboveTable中索引>=4的统统隐藏 */
      formAboveTableCanToggledShowStatusKeys() {
        return this.formItemMetaListAboveTable
          .filter(
            (itemMeta, idx) =>
              idx >= this.formAboveTableCanToggledShowStatusOverIdx
          )
          .map((itemMeta) => itemMeta.key);
      },
      /** 表格上方的表单布局样式 自动根据表单右边按钮数量宽度变化; */
      mixins_formAboveTableLayout() {
        const isLayoutRatioWider =
          this.footerBlockComponentsAboveTable.filter(
            (el) =>
              (el?.isShow ?? true) &&
              el.operationBtnType !== "multi-select-operation-btn"
          ).length >= 3;
        return { "form-above-table-layout": isLayoutRatioWider };
      },
      mixins_changePageOrLimit() {
        return {
          page: this.pageObj.page,
          limit: this.pageObj.limit,
        };
      },
      /** 保存编辑表单元数据list变量的默认命名 */
      mixins_SaveEditDialogFormItemMetaListAlias() {
        return `${
          this.mixins_firstLowerCaseBusinessKey
        }SaveDialogFormItemMetaList`;
      },
      mixins_firstUpperCaseBusinessKey() {
        const businessKey = this.mixins_firstLowerCaseBusinessKey;
        const getFirstUpperCaseBusinessKey = businessKey.replace(
          businessKey[0],
          businessKey[0].toUpperCase()
        );
        return getFirstUpperCaseBusinessKey;
      },
      mixins_firstLowerCaseBusinessKey() {
        const businessKey = this.tableCommonAttr["row-key"].split("-")[0];
        return businessKey;
      },
    },
    watch: {
      //监听分页组件是否触发
      mixins_changePageOrLimit: {
        handler(newVal, oldVal) {
          if (newVal.page > 0) {
            this.mixins_getBussinessKeyList();
          }
        },
        deep: true,
      },
    },
    methods: {
      /** formAboveTable 显示隐藏逻辑 */
      mixins_toggledShowFormAboveTable(eventFromKey) {
        // 受控显示隐藏的key常量数组
        const CanToggledShowStatusKeys = this.formAboveTableCanToggledShowStatusKeys();

        if (CanToggledShowStatusKeys.length === 0) {
          return;
        }
        // 表单项隐藏显示切换
        this.formItemMetaListAboveTable.forEach((el, idx) => {
          if (CanToggledShowStatusKeys.includes(el.key)) {
            const curStatus = el.isShow;
            this.$set(
              this.formItemMetaListAboveTable[idx],
              "isShow",
              !curStatus
            );
          }
        });
        // 切换当前按钮样式;即 展开V  <--->   收缩^
        const eventFromKeyIdx = this.footerBlockComponentsAboveTable.findIndex(
          (el) => el.key === eventFromKey
        );
        this.footerBlockComponentsAboveTable[eventFromKeyIdx]
          .curActivedAttrIdx === 0
          ? this.$set(
              this.footerBlockComponentsAboveTable[eventFromKeyIdx],
              "curActivedAttrIdx",
              1
            )
          : this.$set(
              this.footerBlockComponentsAboveTable[eventFromKeyIdx],
              "curActivedAttrIdx",
              0
            );
      },
      /** 重置分页页码为1 */
      mixins_resetPageNum() {
        this.pageObj.page = 0; // 0 不会引起重新请求
        this.pageObj.page = 1;
      },
      /**
       * 目前仅直接初始化成undefined
       */
      // 快捷的重置表单 统一方法
      mixins_speedFormReset(
        formDataAlias = "formDataAboveTable",
        specialInitMap = {}
      ) {
        const resData = {};
        const specialInitKeys = Object.keys(specialInitMap);
        const formDataKeys = Object.keys(this[formDataAlias]);
        formDataKeys.forEach((key) => {
          // 某些表单字段不按常规初始化
          if (specialInitKeys.includes(key)) {
            resData[key] = specialInitMap[key];
          } else {
            // 常规初始化
            resData[key] = undefined;
          }
        });
        this[formDataAlias] = resData;
      },
      /**
       * 相同策略名合并逻辑
       * 合并事件策略,并直接修改 localStrategys 为合并结果
       * @param {object} localStrategys 本地策略 包括不可覆盖的buildInStrategyKeys中key的策略名 与 可被appendStrategys覆盖的策略
       * @param {object} appendStrategys views/···.vue页面中 用户自定义的事件策略
       * @param {object} buildInStrategyKeys 是localStrategys中不允许被覆盖的策略
       * */
      mixins_sameEventStrategyNameMergeLogic(
        localStrategys,
        appendStrategys,
        buildInStrategyKeys
      ) {
        const oldStrategyKeys = Object.keys(localStrategys);
        const appendStrategyKeys = Object.keys(appendStrategys);
        appendStrategyKeys.forEach((newKey) => {
          //除了 buildInStrategyKeys 其他策略 全都添加进去
          const canAppendStrategy =
            (oldStrategyKeys.includes(newKey) &&
              !buildInStrategyKeys.includes(newKey)) ||
            !oldStrategyKeys.includes(newKey);
          canAppendStrategy
            ? (localStrategys[newKey] = appendStrategys[newKey])
            : null;
        });
      },
      /**
       * 组件的元数据的key名相同时的合并逻辑
       * 合并事件策略,并直接修改 localStrategys 为合并结果
       * @param {Array} localComponentMetaList 本地策略 可以通过占位符 覆盖内建的组件元数据
       * @param {object | null | undefined} appendComponentMetaList views/···.vue页面中 用户自定义的组件元数据
       * */
      mixins_sameComponentMetaKeyNameMergeLogic(
        localComponentMetaList,
        appendComponentMetaList
      ) {
        if (Array.isArray(appendComponentMetaList?.componentKeysArr)) {
          let results = [];
          appendComponentMetaList?.componentKeysArr.forEach(
            (appendKey, idx) => {
              const curComponent = localComponentMetaList.find(
                (component) => component.key === appendKey
              );
              if (curComponent !== undefined) {
                results.push(curComponent);
              } else {
                const willAppendComponent = appendComponentMetaList?.componentMetaDataArr.shift();
                if (willAppendComponent !== undefined) {
                  results.push(willAppendComponent);
                }
              }
            }
          );
          return results;
        } else {
          //默认直接使用内建组件
          return localComponentMetaList;
        }
      },
      /**
       * 执行 需要弹框提示的引发的事件
       *
       * 需要先提示确定后在执行的操作；如，删除等按钮操作
       * @param {string} strategyName 策略名称;根据组件meta数据中自定义
       * @param {int | null} pickedRowIdx 来自表格触发中的行索引;null说明来自其他按钮触发
       */
      mixins_doDialogTipOperationStrategy(
        strategyName,
        pickedRowIdx = null,
        args
      ) {
        //console.log(args, '---------')
        const buildInStrategyKeys = []; //strategys中内置不能被外部覆盖的策略
        const strategys = {
          DeleteRowDialogTipOpen: async () => {
            const deleteId = this.tableBodyData[pickedRowIdx][
              this.tableCommonAttr["row-key"]
            ];
            const res = await this.getBussinessCurdMethodName("Delete")([
              deleteId,
            ]);
            const isSuccessReq = res.code === 0;
            if (isSuccessReq) {
              this.$message.success("删除成功");
            } else {
              return Promise.reject(false);
            }
          },
          TableBatchDeleteDialogTipOpen: async () => {
            let deleteIds = this.curPickedTableRowsData.map(
              (el) => el[this.tableCommonAttr["row-key"]]
            );
            const res = await this.getBussinessCurdMethodName("Delete")(
              deleteIds
            );
            const isSuccessReq = res.code === 0;
            //isSuccessReq ? this.$message.success("删除成功") : null;
            if (isSuccessReq) {
              this.$message.success("删除成功");
            } else {
              return Promise.reject(false);
            }
          },
        };

        //用户自定义的事件策略
        const appendStrategys =
          this?.getDialogTipOpenEventStrategy(
            strategyName,
            pickedRowIdx,
            args
          ) ?? {};

        //合并事件策略
        this.mixins_sameEventStrategyNameMergeLogic(
          strategys,
          appendStrategys,
          buildInStrategyKeys
        );

        this.$confirm("是否执行此操作?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true,
        })
          .then(async () => {
            await strategys?.[strategyName]?.();

            this.mixins_getBussinessKeyList();
          })
          .catch(() => {});
      },
      /**
       * 执行 需要弹窗(表单)开始出现而引发的事件
       *
       * 根据不同策略初始化表单数据,并显示表单等通用操作
       * 初始化步骤包括:
       * 1. 对话框类型: 是表单 还是 表格，默认表单
       * 2. 对话框标题
       * 3. 表单元数据
       * 4. 表单字段绑定的数据
       * 5. 显示表单并传递策略,用于提交按钮的逻辑处理
       * @param {string} strategyName 策略名称;根据组件meta数据中自定义
       * @param {int | null} pickedRowIdx 来自表格触发中的行索引;null说明来自其他按钮触发
       *  */
      async mixins_doInitDialogFormOperationStrategy(
        strategyName,
        pickedRowIdx = null,
        args
      ) {
        const buildInStrategyKeys = []; //strategys中内置不能被外部覆盖的策略
        const strategys = {
          FormAddDialogFormOpen: async () => {
            this.dialogFormTitle = "添加";
            this.dialogFormItemMetaList = cloneDeep(
              this[this.mixins_SaveEditDialogFormItemMetaListAlias]
            );
            const dialogFormData = {};
            this.dialogFormItemMetaList.forEach((itemMeta) => {
              if (allBuildInFormItemTypes.includes(itemMeta.type)) {
                dialogFormData[itemMeta.key] = "";
              }
            });
            this.dialogFormData = dialogFormData;
          },
          EditRowDialogFormOpen: async () => {
            this.dialogFormTitle = "编辑";
            this.dialogFormItemMetaList = cloneDeep(
              this[this.mixins_SaveEditDialogFormItemMetaListAlias]
            );
            // 表单字段的绑定值初始化
            const id = this.tableBodyData[pickedRowIdx][
              this.tableCommonAttr["row-key"]
            ];
            let params = { [this.tableCommonAttr["row-key"]]: id };
            // [this.getBussinessCurdMethodName("GetInfo")]
            this.dialogFormData = await this.mixins_getBussinessKeyInfo(params);
          },
        };

        //用户自定义的事件策略
        const appendStrategys =
          this?.getDialogFormOpenEventStrategy(
            strategyName,
            pickedRowIdx,
            args
          ) ?? {};

        //合并事件策略
        this.mixins_sameEventStrategyNameMergeLogic(
          strategys,
          appendStrategys,
          buildInStrategyKeys
        );

        await strategys?.[strategyName]?.();

        this.dialogFormVisible = true;
        this.curDialogInfo = {
          eventFrom: strategyName,
          pickedRowIdx: pickedRowIdx,
          args: args,
        };
      },
      /**
       * FormAboveTable 表单项内的组件 引发的事件统一处理
       *
       * 这里的事件根据命名规则(前缀、后缀)，可以进而触发"DialogTip" 、"DialogForm"、"TableBatch"、"TableSingle"
       *
       * @param {array} receivedArgs 接收的参数为数组;数组元素必须如下结构 [strategyName,eventFromKey,···用户自定义传入的数据···]
       */
      mixins_doFormAboveTableEventStrategy(receivedArgs) {
        const [strategyName, ...args] = receivedArgs;
        // console.log(`strategyName=${strategyName};eventFromKey=${args[0]};用户自定义传入的数据是否存在=${args.length>1};`)

        const buildInStrategyKeys = ["FormReset", "FormSearch"]; //strategys中内置不能被外部覆盖的策略
        const strategys = {
          FormReset: (eventFromKey) => {
            this.mixins_speedFormReset("formDataAboveTable");
          },
          FormSearch: (eventFromKey) => {
            this.mixins_resetPageNum();
          },
        };

        //用户自定义的事件策略
        const appendStrategys =
          this?.getFormCustomizeEventStrategyAboveTable(strategyName, args) ??
          {};

        //合并事件策略
        this.mixins_sameEventStrategyNameMergeLogic(
          strategys,
          appendStrategys,
          buildInStrategyKeys
        );

        // 弹窗相关策略校验提示
        if (
          strategyName.startsWith("TableBatch") &&
          this.curPickedTableRowsData.length === 0
        ) {
          this.$message.warning("至少选择一项");
          return;
        } else if (
          strategyName.startsWith("TableSingle") &&
          this.curPickedTableRowsData.length !== 1
        ) {
          this.$message.warning("有且仅有一项被选择");
          return;
        }

        // 弹窗相关策略 使用IIFE 以 'DialogFormOpen' 结尾的是弹窗表单, 'DialogTipOpen'结尾的是弹窗提示
        if (strategyName.endsWith("DialogFormOpen")) {
          ((innerArgs) => {
            this.mixins_doInitDialogFormOperationStrategy(
              strategyName,
              null,
              innerArgs
            );
          })(args);
        } else if (strategyName.endsWith("DialogTipOpen")) {
          ((innerArgs) => {
            this.mixins_doDialogTipOperationStrategy(
              strategyName,
              null,
              innerArgs
            );
          })(args);
        } else {
          strategys?.[strategyName]?.(...args);
        }
      },
      /**
       * Table 单元格内的组件 引发的事件统一处理
       *
       * 这里的事件根据命名规则(后缀)，可以进而触发"DialogTip" 、"DialogForm"
       *
       * @param {array} receivedArgs 接收的参数为数组;数组元素必须如下结构 [strategyName,rowIdx,colIdx,colKey,multiComponentIdx,···用户自定义传入的数据···]
       */
      mixins_doTableEventStrategy(receivedArgs) {
        const [strategyName, ...args] = receivedArgs;
        //console.log(`strategyName=${strategyName};rowIdx=${args[0]};colIdx=${args[1]};colKey=${args[2]};multiComponentIdx=${args[3]};用户自定义传入的数据是否存在=${args.length > 4};`)

        const buildInStrategyKeys = []; //strategys中内置不能被外部覆盖的策略

        const strategys = {
          // 内建策略
        };
        //用户自定义的事件策略 //除了 "DialogFormOpen"、"DialogTipOpen"、"OnMultiSelect"，其他策略都必须在 strategys 中配置
        const [pickedRowIdx, ...restArgs] = args;
        const appendStrategys =
          this?.getTableCustomizeEventStrategy(
            strategyName,
            pickedRowIdx,
            restArgs
          ) ?? {};

        //合并事件策略
        this.mixins_sameEventStrategyNameMergeLogic(
          strategys,
          appendStrategys,
          buildInStrategyKeys
        );

        // 弹窗相关策略 使用IIFE 以 'DialogFormOpen' 结尾的是弹窗表单, 'DialogTipOpen'结尾的是弹窗提示
        if (strategyName.endsWith("DialogFormOpen")) {
          ((innerArgs) => {
            const [pickedRowIdx, ...restArgs] = innerArgs;
            this.mixins_doInitDialogFormOperationStrategy(
              strategyName,
              pickedRowIdx,
              restArgs
            );
          })(args);
        } else if (strategyName.endsWith("DialogTipOpen")) {
          ((innerArgs) => {
            const [pickedRowIdx, ...restArgs] = innerArgs;
            this.mixins_doDialogTipOperationStrategy(
              strategyName,
              pickedRowIdx,
              restArgs
            );
          })(args);
        } else if (strategyName === "OnMultiSelect") {
          ((rowsData) => {
            this.curPickedTableRowsData = rowsData;
          })(...args);
        } else {
          strategys?.[strategyName]?.(...args);
        }
      },
      /**
       * 弹窗(表单)出现后的 表单项内的组件 引发的事件统一处理
       */
      mixins_doDialogFormEventStrategy(receivedArgs) {
        // console.log(args,'=====')
        const [strategyName, ...args] = receivedArgs;
        //console.log(`strategyName=${strategyName};eventFromKey=${args[0]};用户自定义传入的数据是否存在=${args.length > 1};`)

        const buildInStrategyKeys = [
          "FormCancelThenClearDialogVisible",
          "ValidSubmit",
        ]; //strategys中内置不能被外部覆盖的策略

        const strategys = {
          // 取消按钮
          FormCancelThenClearDialogVisible: (eventFromKey) => {
            //console.log("成功提交表单", this.formData);
          },
          // 需要校验,必须 Valid 开头; 表单的点击确定
          ValidSubmit: async (eventFromKey) => {
            // console.log('看看事件的参数', eventFromKey);
            const buildInStrategyKeys = []; //strategys中内置不能被外部覆盖的策略

            const strategys = {
              FormAddDialogFormOpen: async () => {
                const res = await this.getBussinessCurdMethodName("Save")(
                  mapKeysToTarget(this.dialogFormData, "BackEnd")
                );
                const isSuccessReq = res.code === 0;
                if (isSuccessReq) {
                  this.$message.success("提交成功");
                } else {
                  return Promise.reject(false);
                }
              },
              EditRowDialogFormOpen: async () => {
                const res = await this.getBussinessCurdMethodName("Update")(
                  mapKeysToTarget(this.dialogFormData, "BackEnd")
                );
                const isSuccessReq = res.code === 0;
                if (isSuccessReq) {
                  this.$message.success("提交成功");
                } else {
                  return Promise.reject(false);
                }
              },
            };

            //用户自定义的事件策略 // 通常需要执行表单提交请求逻辑 //除了 "DialogFormOpen"、"DialogTipOpen"、"OnMultiSelect"，其他策略都必须在 strategys 中配置
            const appendStrategys =
              this?.getDialogFormValidSubmitEventStrategy(
                this.curDialogInfo.eventFrom,
                this.curDialogInfo.pickedRowIdx,
                this.curDialogInfo.args
              ) ?? {}; //TODO:FIXME: 这里参数不能是 strategyName

            //合并事件策略
            this.mixins_sameEventStrategyNameMergeLogic(
              strategys,
              appendStrategys,
              buildInStrategyKeys
            );

            await strategys[this.curDialogInfo.eventFrom]?.();

            //新增或编辑等提交后,需要再次请求表格list
            this.mixins_getBussinessKeyList();

            this.mixins_emitEventStrategy(
              "DialogForm",
              "ThenClearDialogVisible",
              eventFromKey
            );
          },
        };

        //用户自定义的事件策略
        const appendStrategys =
          this?.getDialogFormCustomizeEventStrategy(strategyName, args) ?? {};

        //合并事件策略
        this.mixins_sameEventStrategyNameMergeLogic(
          strategys,
          appendStrategys,
          buildInStrategyKeys
        );

        strategys?.[strategyName]?.(...args);
      },
      ////////////////////////////////////////////////////////////////
      /**
       * 触发事件统一处理
       * 除了在自定义组件里面使用this.$emit触发;其他所有触发都必须调用此函数
       */
      mixins_emitEventStrategy(emitTarget, eventStrategyName, ...args) {
        //console.log(args, 'kkkkkk');
        const FormAboveTableRef = this.$children[0].$refs["FormAboveTableRef"]; //this.$refs["FormAboveTableRef"]
        const TableRef = this.$children[0].$refs["TableRef"]; //this.$refs["TableRef"]
        const DialogFormRef = this.$children[0].$refs["DialogFormRef"]; //this.$refs["DialogFormRef"]
        const emitTo = {
          FormAboveTable: () => {
            FormAboveTableRef.doOperation(eventStrategyName, ...args);
          },
          Table: () => {
            TableRef.doOperation(eventStrategyName, ...args);
          },
          DialogForm: () => {
            DialogFormRef.doOperation(eventStrategyName, ...args);
          },
        };
        emitTo[emitTarget]();
      },
      /**
       * 暂时不会用到;弹窗提示时,取消按钮需要隐藏
       */
      mixins_toggleShowDialogFooterBtn(isShow, keyName = "form-cancel") {
        const dialogFooterBtnIdx = this.footerBlockComponentsModal.findIndex(
          (el) => el.key === keyName
        );
        if (dialogFooterBtnIdx !== -1) {
          this.$set(
            this.footerBlockComponentsModal[dialogFooterBtnIdx],
            "isShow",
            isShow
          );
        }
      },
      /**
       * 弹窗表单时需要获取info数据
       * */
      async mixins_getBussinessKeyInfo(params) {
        const res = await this.getBussinessCurdMethodName("GetInfo")(
          mapKeysToTarget(params, "BackEnd")
        );
        if (res.code !== 0) {
          return {};
        }
        return mapKeysToTarget(res.data);
      },
      /** 命名固定: 表格列表的请求 并字段值映射 */
      async mixins_getBussinessKeyList() {
        //重置多选数据
        this.curPickedTableRowsData = [];

        //null时,进入页面不请求的情况
        if (!this.getBussinessCurdMethodName("GetList")) {
          return;
        }
        //正常请求的情况
        const res = await this.getBussinessCurdMethodName("GetList")({
          page: this.pageObj.page,
          limit: this.pageObj.limit,
          ...mapKeysToTarget(this.formDataAboveTable, "BackEnd"),
        });
        if (res.code !== 0) {
          return;
        }

        this.tableBodyData = mapKeysToTarget(res.data.list);
        this.$set(this.pageObj, "total", res.data.totalCount);
      },
      /** 初始化表格上方的表单的值绑定的对象数据 */
      mixins_initFormDataAboveTable() {
        let formDataAboveTable = {};
        this.formItemMetaListAboveTable.forEach((itemMeta) => {
          formDataAboveTable[itemMeta.key] = undefined;
        });
        this.formDataAboveTable = formDataAboveTable;
      },
      /** 初始化表格上方的表单的切换显示的表单项
       *  外部有提供显示隐藏值时;没有显示隐藏值时 当表单项数量大于4个时,且如果 (展开/收缩)按钮 没有被去掉 ,则会隐藏掉4以上的表单项
       * //TODO:FIXME:最好这里提供组件的宽度占位信息,以便更加智能化 确定 哪些组件需要 展开/收缩
       */
      mixins_initFormAboveTableCanToggledShowStatusKeys() {
        if (this.formAboveTableCanToggledShowStatusKeys.length > 0) {
          const moreBtnIdx = this.footerBlockComponentsAboveTable.findIndex(
            (el) => el.key === "form-more-above-table" && (el?.isShow ?? true)
          );
          moreBtnIdx > -1
            ? this.$set(
                this.footerBlockComponentsAboveTable[moreBtnIdx],
                "isShow",
                true
              )
            : null;
          this.formAboveTableCanToggledShowStatusKeys.forEach((toggledKey) => {
            const canToggledKeyIdx = this.formItemMetaListAboveTable.findIndex(
              (el) => el.key === toggledKey
            );
            if (canToggledKeyIdx > -1) {
              this.$set(
                this.formItemMetaListAboveTable[canToggledKeyIdx],
                "isShow",
                false
              );
            }
          });
          return;
        } else {
          const moreBtnIdx = this.footerBlockComponentsAboveTable.findIndex(
            (el) => el.key === "form-more-above-table" && (el?.isShow ?? true)
          );
          moreBtnIdx > -1
            ? this.$set(
                this.footerBlockComponentsAboveTable[moreBtnIdx],
                "isShow",
                false
              )
            : null;
        }
      },
      /** 合并 初始化表格上方表单的所有按钮组件 */
      mixins_initMergeFooterBlockComponentsAboveTable(
        emitTarget = "FormAboveTable"
      ) {
        //内建的组件元数据
        const localComponentMetaList = [
          {
            key: "form-more-above-table", // 注意与 formMeta.key 均不同
            type: "Button",
            componentAttr: {
              // 组件属性
              type: "primary",
              textVal: "展开",
              icon: {
                class: "el-icon-arrow-down",
                place: "left",
              },
              // style:{'color':'#000'}
            },
            isShow: true,
            // 注意: 如果属性的值是对象需要在继承属性的基础上修改;如style,其它大多数属性都是原始类型
            activedAttrConstList: [
              {
                textVal: "展开",
                icon: {
                  class: "el-icon-arrow-down",
                  // place: "left"
                },
              },
              {
                textVal: "收起",
                icon: {
                  class: "el-icon-arrow-up",
                  // place: "left"
                },
              },
            ],
            curActivedAttrIdx: 0,
            events: (eventFromKey) => {
              return {
                click: () => {
                  // 切换表单显示状态
                  this.mixins_toggledShowFormAboveTable(eventFromKey);
                },
              };
            },
          },
          {
            key: "form-reset-above-table",
            type: "Button",
            componentAttr: {
              type: "info",
              textVal: "重置",
            },
            events: (eventFromKey) => {
              return {
                click: () => {
                  this.mixins_emitEventStrategy(
                    emitTarget,
                    "FormReset",
                    eventFromKey
                  );
                },
              };
            },
          },
          {
            key: "form-search-above-table",
            type: "Button",
            componentAttr: {
              type: "primary",
              textVal: "查询",
              icon: {
                class: "el-icon-search",
                place: "left",
              },
            },
            events: (eventFromKey) => {
              return {
                click: () => {
                  this.mixins_emitEventStrategy(
                    emitTarget,
                    "FormSearch",
                    eventFromKey
                  );
                },
              };
            },
            isShow: checkBtnPermission(
              this,
              this.getBussinessBtnPerms("Search")
            ),
          },
          {
            key: "form-add-above-table",
            type: "Button",
            operationBtnType: "multi-select-operation-btn",
            componentAttr: {
              type: "primary",
              textVal: "添加",
              icon: {
                class: "el-icon-plus",
                place: "left",
              },
            },
            events: (eventFromKey) => {
              return {
                click: async () => {
                  this.mixins_emitEventStrategy(
                    emitTarget,
                    "FormAddDialogFormOpen",
                    eventFromKey
                  );
                },
              };
            },
            isShow: checkBtnPermission(this, this.getBussinessBtnPerms("Save")),
          },
          {
            key: "form-batch-delete-above-table",
            type: "Button",
            operationBtnType: "multi-select-operation-btn",
            componentAttr: {
              type: "warning",
              textVal: "批量删除",
              icon: {
                class: "el-icon-delete",
                place: "left",
              },
            },
            events: (eventFromKey) => {
              return {
                click: async () => {
                  this.mixins_emitEventStrategy(
                    emitTarget,
                    "TableBatchDeleteDialogTipOpen",
                    eventFromKey
                  );
                },
              };
            },
            isShow: checkBtnPermission(
              this,
              this.getBussinessBtnPerms("Delete")
            ),
          },
        ];
        // 用户追加的自定义的组件元数据
        const appendComponentMetaList =
          this?.getAppendFooterBlockComponentsAboveTable?.(emitTarget) ?? null;
        // 合并后返回 并赋值
        this.footerBlockComponentsAboveTable = this.mixins_sameComponentMetaKeyNameMergeLogic(
          localComponentMetaList,
          appendComponentMetaList
        );
      },
      // 合并 初始化表格内的所有按钮组件
      mixins_initMergedTableOperationsBlockComponents(emitTarget = "Table") {
        //内建的组件元数据
        const localComponentMetaList = [
          {
            type: "Button", // 可不填,默认是按钮
            key: "table-edit-btn",
            componentAttr: {
              type: "primary",
              textVal: "编辑",
              size: "small",
            },
            events: (rowIdx, colIdx, colKey, ...data) => {
              return {
                click: () => {
                  // console.log(rowIdx, colIdx, colKey);
                  this.mixins_emitEventStrategy(
                    emitTarget,
                    "EditRowDialogFormOpen",
                    rowIdx,
                    colIdx,
                    colKey,
                    ...data
                  );
                },
              };
            },
            isShow: checkBtnPermission(
              this,
              this.getBussinessBtnPerms("Update")
            ),
          },
          {
            type: "Button", // 可不填,默认是按钮
            key: "table-delete-btn",
            componentAttr: {
              type: "danger",
              textVal: "删除",
              size: "small",
            },
            events: (rowIdx, colIdx, colKey, ...data) => {
              return {
                click: () => {
                  // console.log(rowIdx, colIdx, colKey);
                  this.mixins_emitEventStrategy(
                    emitTarget,
                    "DeleteRowDialogTipOpen",
                    rowIdx,
                    colIdx,
                    colKey,
                    ...data
                  );
                },
              };
            },
            isShow: checkBtnPermission(
              this,
              this.getBussinessBtnPerms("Delete")
            ),
          },
        ];
        // 用户追加的自定义的组件元数据
        const appendComponentMetaList =
          this?.getAppendTableOperationsBlockComponents?.(emitTarget) ?? null;
        // 找到表格的"操作按钮块"索引
        const tableOperationsBlockIdx = this.tableColMetaData.findIndex(
          (colMetaData) => colMetaData.key === "table-operations-block"
        );
        // 合并后返回
        const mergedComponentList = this.mixins_sameComponentMetaKeyNameMergeLogic(
          localComponentMetaList,
          appendComponentMetaList
        );
        // 赋值合并结果
        this.$set(
          this.tableColMetaData[tableOperationsBlockIdx],
          "componentList",
          mergedComponentList
        );
      },
      // 进入页面首先初始化数据(只在created中调用),并请求表格列表
      async mixins_initData() {
        // 第一步: 初始化 formDataAboveTable
        this.mixins_initFormDataAboveTable();
        // 第二步: 初始化 footerBlockComponentsAboveTable
        this.mixins_initMergeFooterBlockComponentsAboveTable();
        // 第三步: 初始化展开折叠的 表单项
        this.mixins_initFormAboveTableCanToggledShowStatusKeys();
        // 第四步: 初始化表格内的所有按钮组件
        this.mixins_initMergedTableOperationsBlockComponents();
        // 请求表格列表
        this.mixins_getBussinessKeyList();
      },
    },
    created() {
      this.mixins_initData();
    },
  };
};
