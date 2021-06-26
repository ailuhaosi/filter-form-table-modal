<template>
  <div>
    <dialog-modal-container
      v-if="isDialogContainer"
      class="dialog-form-container"
      :dialog-form-visible="dialogFormVisible"
      :dialog-center="dialogCenter"
      @clear-dialog-visible="doOperation('ClearDialogVisible').catch(err => {})"
    >
      <template v-slot:dialogTitle>
        <slot name="dialogTitle" />
      </template>
      <template v-slot:default>
        <form-content
          v-if="dialogType==='Form'"
          ref="FormContentRef"
          :form-common-attr="formCommonAttr"
          :form-item-meta-list="formItemMetaList"
          :form-data="formData"
          :style="{'max-height':'50vh'}"
          @update:form-data="(val)=>$emit('update:form-data',val)"
          @do-operation="doOperation(...arguments).catch(err => {})"
        >
          <template
            v-for="formSlot in formItemMetaList.filter(item=>item.type==='FormItemSlot')"
            v-slot:[formSlot.key]="slotProps"
          >
            <div :key="formSlot.key">
              <slot
                :name="formSlot.key"
                :form-data="slotProps.formData"
              />
            </div>
          </template>
        </form-content>
        <slot
          v-else-if="(typeof dialogType==='string') && dialogType.startsWith('Customize')"
          name="customizeDialogContent"
        />
      </template>
      <template v-slot:footerBlockComponents>
        <footer-block-components
          :block-components="footerBlockComponents"
          @do-operation="doOperation(...arguments).catch(err => {})"
        />
      </template>
    </dialog-modal-container>
    <!-- //TODO: 拷贝自上面 -->
    <div
      v-else
      class="common-form-container"
    >
      <div style="min-width:100%;display:flex;">
        <form-content
          ref="FormContentRef"
          class="form-content-box"
          :form-common-attr="formCommonAttr"
          :form-item-meta-list="formItemMetaList"
          :form-data="formData"
          @update:form-data="(val)=>$emit('update:form-data',val)"
          @do-operation="doOperation(...arguments).catch(err => {})"
        >
          <template v-slot:formTitle>
            <slot name="formTitle" />
          </template>
          <template
            v-for="formSlot in formItemMetaList.filter(item=>item.type==='FormItemSlot')"
            v-slot:[formSlot.key]="slotProps"
          >
            <div :key="formSlot.key">
              <slot
                :name="formSlot.key"
                :form-data="slotProps.formData"
              />
            </div>
          </template>
        </form-content>
        <!-- 左右布局的按钮在这里渲染 -->
        <div class="default-btns-box">
          <footer-block-components
            operation-btn-type="common-operation-btn"
            :block-components="footerBlockComponents"
            @do-operation="doOperation(...arguments).catch(err => {})"
          />
        </div>
      </div>
      <!-- 需要换行的表格上方按钮在这里渲染 -->
      <div
        class="multi-select-operation-btns-box"
        style="display:block;min-width:100%;margin-left:30px;margin-bottom:20px;"
      >
        <footer-block-components
          operation-btn-type="multi-select-operation-btn"
          :block-components="footerBlockComponents"
          @do-operation="doOperation(...arguments).catch(err => {})"
        />
      </div>
    </div>
  </div>
</template>

<script>
import DialogModalContainer from './container/dialog-modal-container.vue'
import FormContent from './form-content.vue'
import FooterBlockComponents from './footer-block-components.vue'
export default {
  name: 'CustomizeForm',
  components: {
    DialogModalContainer,
    FormContent,
    FooterBlockComponents
  },
  props: {
    /* dialog容器相关 */
    isDialogContainer: {
      type: Boolean,
      require: true,
      default: true
    },
    dialogType: {
      type: String,
      default: 'Form'
    },
    dialogFormVisible: {
      type: Boolean,
      default: false
    },
    dialogCenter: {
      type: Boolean,
      default: false
    },
    // ///////////////////////
    formCommonAttr: {
      type: Object,
      default: () => ({})
    },
    /* 表单底部按钮区块相关 */
    footerBlockComponents: {
      type: Array,
      default: () => {
        return [{
          key: '',
          event: {
            emitType: 'click',
            emitName: '' // "Submit","Cancel"
          },
          componentAttr: {// 组件属性,防止键名冲突//可不设置
            type: 'primary'
          },
          placeholder: '',
          icon: {
            class: 'el-icon-upload',
            place: 'left'
          }
        }]
      }
    },
    // ///////////////////////
    /* 普通的表单的相关参数:元数据、表单值绑定 */
    formItemMetaList: {// 表单每一项使用单(多)个 input 、 单(多)个select 还是 单个 ratioGroup
      type: Array,
      require: true,
      default() {
        return [{
          label: '账号',
          formLabelWidth: '120px',
          // 可能的多个组件
          type: 'Input',
          placeholder: '', // 专门用于input
          key: 'account', // 被v-model的key
          // //////////////////
          // options专门用于 select 或 checkbox-group
          options: [
            { label: '公司1', value: '1' }, { label: '公司2', value: '2' }, { label: '公司3', value: '3' }, { label: '公司4', value: '4' }
          ],
          rule: [{ required: true, message: 'ssssss' }], // element的表单校验
          events: {// 表单的事件//如: 表单的input改变,引发某个select的options改变
            // click:()=>{console.log('click事件触发')},
            change: () => { console.log('change事件触发') },
            focus: () => { console.log('focus事件触发') }
          }
          // checkbox-group <el-checkbox-group v-model="checkedCities" @change="handleCheckedChange"><el-checkbox v-for="option in options" :label="option.value" :key="option.value">{{option.label}}</el-checkbox></el-checkbox-group>
        }]
      }
    },
    formData: {
      type: Object,
      require: true,
      default: () => {
        return {
          account: ''
        }
      }
    }
  },
  data() {
    return {

    }
  },
  watch: {
    // FIXME: 修复表单组件复用时,再次打开时的错误校验信息未清除
    dialogFormVisible: {
      handler(newVal, oldVal) { //  && this.formItemMetaList.some(el => !!el.rule)
        if (newVal && !((typeof this.dialogType === 'string') && this.dialogType.startsWith('Customize'))) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.$refs['FormContentRef'].clearValidateForm()
            }, 0)
          })
        }
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @param {String|Array} validateTarget
     * validateTarget如果是String,则校验一个字段
     * validateTarget如果是Array,则校验多个字段
     */
    triggerValidateForm(validateTarget) {
      this.$refs['FormContentRef'].triggerValidateForm(validateTarget)
    },
    /**
     * @param {String} emitName 触发名;以Valid开头表示此动作会校验表单;以ClearDialogVisible结尾的表示会关闭dialog。
     * @param {String} eventFromKey 触发事件的表单key;相当于哪个行触发事件
     */
    async doOperation(emitName, ...args) {
      if (emitName.startsWith('Valid')) {
        const valid = await this.$refs['FormContentRef'].$refs['RuleFormRef'].validate()
        if (!valid) {
          console.log('校验失败')
          return Promise.resolve(false)
        }
      }
      if (emitName.endsWith('ClearDialogVisible')) {
        this.$emit('update:dialog-form-visible', false)
        if (emitName === 'ClearDialogVisible') {
          return Promise.resolve(true)
        }
      }
      this.$emit('do-operation', emitName, ...args)
      return Promise.resolve(true)
    }
  }
}
</script>

<style lang="scss" scoped>
.common-form-container .form-content-box {
  width: calc(100%-200px);
  display: flex;
  flex: auto;
}
.common-form-container .default-btns-box {
  width: 200px;
  display: flex;
  flex: 0 0 auto;
}
</style>
