<template>
  <div style="text-align:center;margin-bottom:50px;margin-left:30px;margin-right:20px;">
    <el-table
      ref="CustomizeTableRef"
      v-loading="tableListLoading"
      class="customize-table"
      :class="optionChainHack(tableCommonAttr,['class'],{'customize-table-not-dropped-status':false})"
      :data="syncTableBodyData"
      :default-expand-all="optionChainHack(tableCommonAttr,['default-expand-all'],false)"
      :lazy="optionChainHack(tableCommonAttr,['lazy'],false)"
      :load="optionChainHack(tableCommonAttr,['load'],undefined)"
      :row-key="optionChainHack(tableCommonAttr,['row-key'],undefined)"
      :tree-props="optionChainHack(tableCommonAttr,['tree-props'],undefined)"
      :indent="optionChainHack(tableCommonAttr,['indent'],16)"
      :header-cell-style="optionChainHack(tableCommonAttr,['header-cell-style'],{})"
      :border="optionChainHack(tableCommonAttr,['border'],true)"
      :fit="optionChainHack(tableCommonAttr,['fit'],true)"
      :highlight-current-row="optionChainHack(tableCommonAttr,['highlight-current-row'],true)"
      :style="optionChainHack(tableCommonAttr,['style'],{width:'100%'})"
      @selection-change="onMultiSelectionChange"
      @cell-click="onCellClick"
      @expand-change="onExpandChange"
    >
      <template v-for="(item,colIdx) in tableColMetaData">
        <el-table-column
          v-if="optionChainHack(item,['isShow'],true)"
          :key="item.key"
          :prop="item.key"
          :class="item.key"
          :type="optionChainHack(item,['colType'],undefined)"
          :label="optionChainHack(item,['label'],'')"
          :style="optionChainHack(item,['colStype'],{})"
          :align="optionChainHack(item,['align'],'center')"
          :show-overflow-tooltip="optionChainHack(item,['show-overflow-tooltip'],false)"
          :width="optionChainHack(item,['width'],undefined)"
          :min-width="optionChainHack(item,['min-width'],undefined)"
          :formatter="optionChainHack(item,['formatter'],undefined)"
        >
          <!-- :class-name="item.key" -->
          <template
            v-if="item.customizeHeader"
            v-slot:header="scope"
          >
            <slot
              :name="'customize-header-'+item.key"
              :item-col-meta-data="item"
            >
              {{ item.label }}
            </slot>
          </template>
          <template
            v-if="item.colType!=='selection'"
            v-slot:default="{row,$index:rowIdx}"
          >
            <!-- 简单的纯文本 -->
            <div
              v-if="optionChainHack(item,['type'],'Text')==='Text'"
              :style="getRowAttrVal(row,rowIdx,item,['componentAttr','style'],{})"
            >
              {{ row[item.key] }}
            </div>

            <!-- 序号 -->
            <span v-else-if="item.type==='SerialNum'">
              <template v-if="item.generateSerialNum===undefined">
                {{ rowIdx+1 }}
              </template>
              <template v-else-if="!!optionChainHack(item,['generateSerialNum'],(rowIdx,page,limit)=>{})">
                {{ optionChainHack(item,['generateSerialNum'],(rowIdx,page,limit,total)=>{return rowIdx+1+(page-1)*limit})(rowIdx,pageObj.page,pageObj.limit,pageObj.total) }}
                <!-- {{ rowIdx+1+(pageObj.page-1)*pageObj.limit }} -->
              </template>
            </span>

            <!-- 也是简单的文本: 根据后台返回key,需要映射成对应value -->
            <div
              v-else-if="item.type==='MatchMapVal'"
              :style="getRowAttrVal(row,rowIdx,item,['componentAttr','style'],{})"
            >
              {{ optionChainHack(optionChainHack(item,['matchMapObj','value'],{}),[row[item.key]],optionChainHack(item,['matchMapObj','default'],'')) }}
            </div>

            <!-- 单选组件 -->
            <el-radio
              v-else-if="item.type==='SingleSelection'"
              v-model="syncSingleSelectionVals[item.key]"
              :label="row[item.key.replace('single-selection-','')]"
              @change="(val)=>onChangeSingleSelection(val, rowIdx, colIdx)"
              @click.native.stop
            >{{ '' }}</el-radio>

            <!-- 输入框----可编辑、可只读 -->
            <!--
            复杂点注意:
            1. 因为这里的属性 并不是 一整列都是相同的; 如第一行可编辑,其它行只读
            2. 使用高阶函数作为events的属性;因为需要绑定多个事件,单个事件就不需要这么复杂
            //TODO: 本组件中的所有 optionChainHack 都可以根据需要用 getRowAttrVal 来升级替换,可保证兼容性。
          -->
            <el-input
              v-else-if="item.type==='Input'"
              v-model="row[item.key]"
              autocomplete="off"
              :style="getRowAttrVal(row,rowIdx,item,['componentAttr','style'],{})"
              :placeholder="getRowAttrVal(row,rowIdx,item,['componentAttr','placeholder'],'')"
              :type="getRowAttrVal(row,rowIdx,item,['componentAttr','type'],'text')"
              :readonly="getRowAttrVal(row,rowIdx,item,['componentAttr','readonly'],false)"
              :disabled="getRowAttrVal(row,rowIdx,item,['componentAttr','disabled'],false)"
              v-on="optionChainHack(item,['events'],(rowIdx,colIdx,colKey)=>({}))(rowIdx,colIdx,item.key)"
            />

            <!-- 可编辑、可只读 -->
            <el-switch
              v-else-if="item.type==='Switch'"
              v-model="row[item.key]"
              :active-color="optionChainHack(item,['componentAttr','active-color'],'#3CB371')"
              :inactive-color="optionChainHack(item,['componentAttr','inactive-color'],'#FF0000')"
              :active-value="optionChainHack(item,['componentAttr','active-value'],true)"
              :inactive-value="optionChainHack(item,['componentAttr','inactive-value'],false)"
              :active-icon-class="optionChainHack(item,['componentAttr','active-icon-class'],'')"
              :inactive-icon-class="optionChainHack(item,['componentAttr','inactive-icon-class'],'')"
              :active-text="optionChainHack(item,['componentAttr','active-text'],'')"
              :inactive-text="optionChainHack(item,['componentAttr','inactive-text'],'')"
              :disabled="getRowAttrVal(row,rowIdx,item,['componentAttr','disabled'],false)"
              :readonly="getRowAttrVal(row,rowIdx,item,['componentAttr','readonly'],false)"
              v-on="optionChainHack(item,['events'],(rowIdx,colIdx,colKey)=>({}))(rowIdx,colIdx,item.key)"
            />

            <!-- 头像 -->
            <el-avatar
              v-else-if="item.type==='Avatar' && row[item.key]"
              :src="row[item.key]"
              :size="optionChainHack(item,['componentAttr','size'],'medium')"
            />

            <!-- 头像图片不存在情况 -->
            <div
              v-else-if="item.type==='Avatar' && !row[item.key]"
            />

            <!-- 用于表格ceil较复杂时,比slot更优雅 -->
            <!-- 这里如果要定制行样式,可以根据 rowIdx 来写 -->
            <customize-table-ceil-async-load
              v-else-if="optionChainHack(item,['type'],'CustomizeTableCeil')==='CustomizeTableCeil'"
              :class="item.key"
              :root-path-type="optionChainHack(item,['rootPathType'],'views')"
              :component-file-path="item.componentFilePath"
              :table-ceil-key="item.key"
              :component-attr="optionChainHack(item,['componentAttr'],{})"
              :row-data="row"
              :row-idx="rowIdx"
              @update:row-data="(rowData)=>updateRowData(rowData,rowIdx)"
              v-on="$listeners"
            />

            <!-- 一个单元格多个组件;通常是多个操作按钮 -->
            <div v-else-if="item.type==='MultiComponents'">
              <template v-for="(component,componentIdx) in item.componentList">
                <!-- 按钮类型 -->
                <el-button
                  v-if="optionChainHack(component,['type'],'Button')==='Button'"
                  v-show="optionChainHack(component,['isShow'],true)"
                  :key="component.key"
                  :class="component.key"
                  :type="getRowAttrVal(row,rowIdx,component,['componentAttr','type'],'primary')"
                  :style="getRowAttrVal(row,rowIdx,component,['componentAttr','style'],{})"
                  :disabled="getRowAttrVal(row,rowIdx,component,['componentAttr','disabled'],false)"
                  :size="optionChainHack(component,['componentAttr','size'],'medium')"
                  v-on="optionChainHack(component,['events'],(rowIdx,colIdx,colKey,componentIdx)=>({}))(rowIdx,colIdx,component.key,componentIdx)"
                >
                  <i
                    v-if="getRowAttrVal(row,rowIdx,component,['componentAttr','icon','place'],'left')==='left'"
                    :class="getRowAttrVal(row,rowIdx,component,['componentAttr','icon','class'],'')"
                  />
                  {{ getRowAttrVal(row,rowIdx,component,['componentAttr','textVal'],'') }}
                  <i
                    v-if="getRowAttrVal(row,rowIdx,component,['componentAttr','icon','place'],'left')==='right'"
                    :class="getRowAttrVal(row,rowIdx,component,['componentAttr','icon','class'],'')"
                  />
                </el-button>

                <!-- Icon类型 -->
                <div
                  v-else-if="optionChainHack(component,['type'],'Icon')==='Icon'"
                  v-show="optionChainHack(item,['isShow'],true) ? optionChainHack(component,['isShow'],true) : false"
                  :key="component.key"
                  :class="component.key"
                  :style="getRowAttrVal(row,rowIdx,component,['componentAttr','container-style'],{display:'inline-block','margin-left':'15px',cursor: 'pointer'})"
                >
                  <i :class="getRowAttrVal(row,rowIdx,component,['componentAttr','class'],'')" />
                </div>

                <!-- 复杂的表格单元格 比slot更优雅,推荐使用 -->
                <customize-table-ceil-async-load
                  v-else-if="optionChainHack(component,['type'],'CustomizeTableCeil')==='CustomizeTableCeil'"
                  v-show="optionChainHack(item,['isShow'],true) ? optionChainHack(component,['isShow'],true) : false"
                  :key="component.key"
                  :class="component.key"
                  :root-path-type="optionChainHack(component,['rootPathType'],'views')"
                  :component-file-path="component.componentFilePath"
                  :table-ceil-key="`${item.key},${component.key}`"
                  :component-attr="optionChainHack(component,['componentAttr'],{})"
                  :row-data="row"
                  :row-idx="rowIdx"
                  @update:row-data="(rowData)=>updateRowData(rowData,rowIdx)"
                  v-on="$listeners"
                />
              </template>
            </div>

            <!-- <div v-else /> -->
          </template>
        </el-table-column>
      </template>
    </el-table>
    <!-- TODO:FIXME: 表格无限滚动懒加载待做 -->
    <!-- tableType 分为 Pagination、InfinteRoll、LazyRoll -->
    <el-pagination
      v-if="optionChainHack(tableCommonAttr,['tableType'],'Pagination')!=='InfinteRoll'"
      style="margin-top:20px;"
      :current-page="syncPageObj.page"
      :pager-count="5"
      :page-sizes="[10,20,50]"
      :page-size="syncPageObj.limit"
      layout="total, sizes, prev, pager, next, jumper"
      :total="syncPageObj.total"
      @current-change="(val)=>handlePaginationChange('PageChange',val)"
      @size-change="(val)=>handlePaginationChange('SizeChange',val)"
    />
  </div>
</template>

<script>
import { nullishCoalescingOperator } from './utils'
import eq from 'lodash/eq'
import cloneDeep from 'lodash/cloneDeep'
import CustomizeTableCeilAsyncLoad from './customize-table-ceil-async-load.vue'

export default {
  components: {
    CustomizeTableCeilAsyncLoad
  },
  props: {
    pageObj: {
      type: Object,
      default() {
        return { page: 1, limit: 10, total: 0 }
      }
    },
    tableHeaderStyleObj: {
      type: Object,
      // required: true,
      default() {
        return {
          'background-color': '#EDF6FA'
        }
      }
    },
    tableListLoading: {
      default: false,
      type: Boolean,
      required: true
    },
    tableCommonAttr: {
      type: Object,
      default: () => ({})
    },
    /* 表头的一整列的公共的属性;数组元素个数与表格列数相同 */
    // 其中 componentAttr 对象里面 是一整的通用继承属性
    // 其中 componentRowAttrs 数组里面 是某个具体行的属性;该行属性会覆盖 componentAttr 里的属性
    tableColMetaData: {
      default: () => ([]), // {type,label,width,minWidth,buttonList}//type分为: text,icon,button//buttonList中每个元素为: {name,type,icon}
      type: Array
      // required: true
    },
    tableBodyData: {
      default: () => ([]),
      type: Array
      // required: true
    }
  },
  data() {
    return {
      syncPageObj: {
        page: 1,
        limit: 10,
        total: 0
      },
      syncSingleSelectionVals: {},
      syncTableBodyData: [],
      // //////////////////
      treeTableExpandedIds: []
      // //////////////
    }
  },
  computed: {
    singleSelectionVals() {
      const resVals = {}
      this.tableColMetaData.forEach((colMeta, idx) => {
        if (colMeta.type === 'SingleSelection') {
          resVals[colMeta.key] = colMeta.singleSelectionVal
        }
      })
      return resVals
    }
  },
  watch: {
    pageObj: {
      handler(newVal, oldVal) {
        if (!eq(newVal, this.syncPageObj)) {
          // console.log('第一次引用====')
          this.$set(this, 'syncPageObj', newVal)
        }
      },
      deep: true,
      immediate: true
    },
    singleSelectionVals: {
      handler(newVal, oldVal) {
        this.$set(this, 'syncSingleSelectionVals', newVal)
      },
      immediate: true,
      deep: true
    },
    tableBodyData: {
      handler(newVal, oldVal) {
        if (!eq(newVal, this.syncTableBodyData)) {
          // console.log('第一次引用====')
          this.$set(this, 'syncTableBodyData', newVal)
        }
      },
      immediate: true,
      deep: true
    },
    syncTableBodyData: {
      handler(newVal, oldVal) {
        this.updateTableData(newVal)
      },
      deep: true
    },
    tableCommonAttr: {
      handler(newVal, oldVal) {
        if (!eq(newVal?.['tree-table-expanded-ids'], this.treeTableExpandedIds)) {
          if (newVal?.['tree-table-expanded-ids'] !== undefined) {
            this.$set(this, 'treeTableExpandedIds', newVal['tree-table-expanded-ids'])
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  // TODO:
  created() {
    // console.log('---------')
    this.$nextTick(() => {
      // this.setSort()
    })
  },
  updated() {
    // this.expandTreeTable()
  },
  methods: {
    doOperation(emitName,rowIdx, colIdx,colKey,...data){
      this.$emit('do-operation', emitName, rowIdx, colIdx, colKey,...data)
    },
    updateRowData(rowData, rowIdx) {
      const syncTableBodyData = cloneDeep(this.syncTableBodyData)
      syncTableBodyData[rowIdx] = rowData
      this.$emit('update:table-body-data', syncTableBodyData)
    },
    updateTableData(val) {
      this.$emit('update:table-body-data', val)
    },
    onChangeSingleSelection(val, rowIdx, colIdx) {
      this.$emit('update:single-selection', rowIdx, colIdx, this.tableColMetaData[colIdx].key, val)
      this.$emit('do-operation', 'PickedSingleSelection', rowIdx, colIdx, this.tableColMetaData[colIdx].key, val)
    },
    onCellClick(row, column, cell, event) {
      const colIdx = this.tableColMetaData.findIndex(el => el.key === column.property)
      const rowIdx = this.syncTableBodyData.findIndex(el => el === row)
      // console.log(rowNum, colIdx, '========', column, row);
      this.$emit('do-operation', 'OnCellClick', rowIdx, colIdx, column.property)
    },
    onMultiSelectionChange(selection) {
      // console.log(selection,'多选===');
      this.$emit('do-operation', 'OnMultiSelect', selection)
    },
    onExpandChange(row, expandedVal) {
      if (Array.isArray(expandedVal)) { // 展开行
        // console.log(expandedVal.includes(row))
      } else { // 树形组件
        if (this.tableCommonAttr?.['row-key'] === undefined) {
          return false
        }
        const curIdx = this.treeTableExpandedIds.indexOf(row[this.tableCommonAttr['row-key']])
        if (curIdx === -1) { // 展开
          this.treeTableExpandedIds.push(row[this.tableCommonAttr['row-key']])
        } else { // 缩起
          this.treeTableExpandedIds.splice(curIdx, 1)
        }
      }
      // console.log(row, expandedVal)
    },
    handlePaginationChange(typeName, val) {
      const pageObj = { ...this.syncPageObj }
      switch (typeName) {
        case 'PageChange':
          pageObj.page = val
          // this.$set(this.syncPageObj, "page", val);
          break
        case 'SizeChange':
          pageObj.limit = val
          // this.$set(this.syncPageObj, "limit", val);
          break
        default:
          break
      }
      this.$emit('update:page-obj', pageObj)
      /**
       * @require @param {String} 'do-operation': 触发的总线事件名;固定;
       * @require @param {String} typeName: 具体触发的事件名
       * @require @param {Number} rowNum: 行号;当rowNum=-1,colIdx=-1时 触发分页改变的事件
       * @param {String|Number} colIdx: 列号;当rowNum=-1,colIdx=-1时 触发分页改变的事件
       * @param {any} data: 其它可能传递的数据
       */
      this.$emit('do-operation', typeName, -1, -1, pageObj)
    },
    batchExpandTreeTable(treeTableExpandedIds) {
      const treeIconColIdx = (this.tableColMetaData.filter(colMetaData => colMetaData?.colType !== undefined)).length + 1
      // this.syncTableBodyData
      const els = this.$refs['CustomizeTableRef'].$el.querySelectorAll(`td[class*='_column_${treeIconColIdx}']  div[class='el-table__expand-icon']`) // 获取点击的箭头元素
      els.forEach(el => {
        el.click()
      })
    },
    /**
     * 调用函数进行,模拟点击实现树形表格的展开
     */
    expandTreeTable() {
      const treeIconColIdx = (this.tableColMetaData.filter(colMetaData => colMetaData?.colType !== undefined)).length + 1
      // el-table_1_column_3
      // document.querySelectorAll(`td[class*='_column_${treeIconColIdx}']  div[class*='el-table__expand-icon']`)
      const els = this.$refs['CustomizeTableRef'].$el.querySelectorAll(`td[class*='_column_${treeIconColIdx}']  div[class='el-table__expand-icon']`) // 获取点击的箭头元素
      els.forEach(el => {
        el.click()
      })
    },
    // ///////////////固定的工具方法//////////////////////////////////
    /**
     * 可选链的hack: 判断obj.a.b.c 是否 不为 undefined 或 null 则返回,否则返回默认值
     * @param {object} obj 原始对象
     * @param {Array} attars 按层级次序的属性数组
     * @param {any} defaultVal 默认值
     * */
    optionChainHack(obj, attrs, defaultVal) {
      let curObj = { ...obj }
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i]
        curObj = curObj?.[attr]
      }
      return curObj ?? defaultVal
      // return nullishCoalescingOperator(curObj,defaultVal);
    },
    /**
     * //TODO: 整表属性  事件激活属性可以不用,可以在具体事件方法中手写
     * 分为 事件激活属性、当前行属性、列通用属性;如果前者存在,则后者不会体现会被覆盖。
     * 设置当前行的属性值: 先继承列的通用属性,再用当前行具体属性去覆盖
     * @param {Number} rowNum
     * @param {object} obj 原始对象
     * @param {Array} attars 按层级次序的属性数组
     * @param {any} defaultVal 默认值
     */
    getRowAttrVal(row, rowIdx, obj, attrs, defaultVal) {
      // 读取继承属性
      const inheritAttrVal = this.optionChainHack(obj, attrs, defaultVal)
      // 读取当前行属性值
      let curRowAttrVal
      const typeofStr = typeof (obj?.curRowAttr)
      if (typeofStr === 'function') {
        const componentRowAttrObj = obj?.curRowAttr(row, rowIdx)
        const curObj = { ...componentRowAttrObj }
        const [, ...curAttrs] = attrs
        curRowAttrVal = this.optionChainHack(curObj, curAttrs, undefined)
      } else if (typeofStr === 'object' && !Array.isArray(obj?.curRowAttr)) {
        const componentRowAttrObj = obj?.curRowAttr
        const curObj = { ...componentRowAttrObj }
        const [, ...curAttrs] = attrs
        curRowAttrVal = this.optionChainHack(curObj, curAttrs, undefined)
      } else {
        curRowAttrVal = undefined
      }
      // 读取当前行事件激活的属性值
      let eventActivedAttrVal
      const everyRowActivedAttrIdxList = obj?.everyRowActivedAttrIdxList ?? []
      // const everyRowActivedAttrIdxList = nullishCoalescingOperator(obj?.everyRowActivedAttrIdxList,[]);
      if (everyRowActivedAttrIdxList.length > 0) {
        const [, ...curAttrs] = attrs
        eventActivedAttrVal = this.optionChainHack(obj.activedAttrConstList[everyRowActivedAttrIdxList[rowIdx]], curAttrs, undefined)
      }
      /* if (obj.type === 'MatchMapVal') {
        console.log('最终====', curRowAttrVal,obj?.curRowAttr(row, rowIdx))
      } */
      return eventActivedAttrVal ?? curRowAttrVal ?? inheritAttrVal
      // return nullishCoalescingOperator(nullishCoalescingOperator(eventActivedAttrVal,curRowAttrVal),inheritAttrVal);
    }
  }
}
</script>

<style scoped>
/* 禁止拖拽释放的鼠标样式 */
.customize-table-not-dropped-status,
.customize-table-not-dropped-status * {
  cursor: not-allowed !important;
}

.sortable-ghost {
  pointer-events: none;
  background-color: #eee;
}

/*  */
.high-light-row {
  background-color: red;
}
</style>
