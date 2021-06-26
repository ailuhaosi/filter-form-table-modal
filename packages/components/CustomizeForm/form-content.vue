<template>
  <div>
    <slot name="formTitle" />
    <el-form
      ref="RuleFormRef"
      :model="syncFormData"
      :rules="rules"
      :label-width="optionChainHack(formCommonAttr,['label-width'],'120px')"
      :disabled="optionChainHack(formCommonAttr,['disabled'],false)"
      class="form-content"
    >
      <template v-for="(formMeta,index) in formItemMetaList">
        <el-form-item
          v-show="optionChainHack(formMeta,['isShow'],true)"
          :key="index"
          :ref="formMeta.key+'Ref'"
          :prop="formMeta.key"
          :label="formMeta.label"
          :label-width="formMeta.formLabelWidth"
          :class="formMeta.key"
        >
          <!--  -->
          <el-input
            v-if="formMeta.type==='Input'"
            v-model="syncFormData[formMeta.key]"
            autocomplete="off"
            :style="optionChainHack(formMeta,['componentAttr','style'],{})"
            :placeholder="optionChainHack(formMeta,['componentAttr','placeholder'],'')"
            :type="optionChainHack(formMeta,['componentAttr','type'],'text')"
            :readonly="getCurComponentAttrWithInheritedAttr(formMeta,['componentAttr','readonly'],false)"
            :disabled="optionChainHack(formMeta,['componentAttr','disabled'],false)"
            v-on="optionChainHack(formMeta,['events'],(formItemKey)=>({}))(formMeta.key)"
          />

          <!-- el-select、el-checkbox-group、switch没有readonly属性只能遮罩hack -->
          <el-select
            v-else-if="formMeta.type==='Select'"
            v-model="syncFormData[formMeta.key]"
            :class="{'readonly-component':getCurComponentAttrWithInheritedAttr(formMeta,['componentAttr','readonly'],false)}"
            :style="optionChainHack(formMeta,['componentAttr','style'],{})"
            :placeholder="optionChainHack(formMeta,['componentAttr','placeholder'],'')"
            :multiple="optionChainHack(formMeta,['componentAttr','multiple'],false)"
            :collapse-tags="optionChainHack(formMeta,['componentAttr','collapse-tags'],false)"
            :disabled="optionChainHack(formMeta,['componentAttr','disabled'],false)"
            v-on="optionChainHack(formMeta,['events'],(formItemKey)=>({}))(formMeta.key)"
          >
            <el-option
              v-for="option in formMeta.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <!--  -->
          <el-checkbox-group
            v-else-if="formMeta.type==='CheckboxGroup'"
            v-model="syncFormData[formMeta.key]"
            :class="{'readonly-component':getCurComponentAttrWithInheritedAttr(formMeta,['componentAttr','readonly'],false)}"
            :disabled="optionChainHack(formMeta,['componentAttr','disabled'],false)"
            v-on="optionChainHack(formMeta,['events'],(formItemKey)=>({}))(formMeta.key)"
          >
            <el-checkbox
              v-for="option in formMeta.options"
              :key="option.value"
              :label="option.value"
              :disabled="option.disabled ? option.disabled : false"
              :border="option.border ? option.border : false"
            >{{ option.label }}</el-checkbox>
          </el-checkbox-group>

          <!--  -->
          <el-radio-group
            v-else-if="formMeta.type==='RadioGroup'"
            v-model="syncFormData[formMeta.key]"
            :class="{'readonly-component':getCurComponentAttrWithInheritedAttr(formMeta,['componentAttr','readonly'],false)}"
            v-on="optionChainHack(formMeta,['events'],(formItemKey)=>({}))(formMeta.key)"
          >
            <el-radio
              v-for="option in formMeta.options"
              :key="option.value"
              :label="option.value"
              :disabled="option.disabled ? option.disabled : false"
            >{{ option.label }}</el-radio>
          </el-radio-group>

          <!--  -->
          <el-switch
            v-else-if="formMeta.type==='Switch'"
            v-model="syncFormData[formMeta.key]"
            :class="{'readonly-component':getCurComponentAttrWithInheritedAttr(formMeta,['componentAttr','readonly'],false)}"
            :active-color="optionChainHack(formMeta,['componentAttr','active-color'],'#3cb371')"
            :inactive-color="optionChainHack(formMeta,['componentAttr','inactive-color'],'#FF0000')"
            :active-value="optionChainHack(formMeta,['componentAttr','active-value'],true)"
            :inactive-value="optionChainHack(formMeta,['componentAttr','inactive-value'],false)"
            :active-icon-class="optionChainHack(formMeta,['componentAttr','active-icon-class'],'')"
            :inactive-icon-class="optionChainHack(formMeta,['componentAttr','inactive-icon-class'],'')"
            :active-text="optionChainHack(formMeta,['componentAttr','active-text'],'')"
            :inactive-text="optionChainHack(formMeta,['componentAttr','inactive-text'],'')"
            :readonly="getCurComponentAttrWithInheritedAttr(formMeta,['componentAttr','readonly'],false)"
            :disabled="optionChainHack(formMeta,['componentAttr','disabled'],false)"
            v-on="optionChainHack(formMeta,['events'],(formItemKey)=>({}))(formMeta.key)"
          />

          <!--  -->
          <!-- ['year','month','date','dates','week','datetime','datetimerange','daterange','monthrange'] -->
          <el-date-picker
            v-if="formMeta.type.startsWith('Date')"
            v-model="syncFormData[formMeta.key]"
            :style="optionChainHack(formMeta,['componentAttr','style'],{})"
            :type="optionChainHack(formMeta,['componentAttr','type'],'daterange')"
            :placeholder="optionChainHack(formMeta,['componentAttr','placeholder'],'选择日期')"
            :start-placeholder="optionChainHack(formMeta,['componentAttr','start-placeholder'],'开始日期')"
            :end-placeholder="optionChainHack(formMeta,['componentAttr','end-placeholder'],'结束日期')"
            :range-separator="optionChainHack(formMeta,['componentAttr','range-separator'],'至')"
            :format="optionChainHack(formMeta,['componentAttr','format'],'yyyy-MM-dd HH:mm:ss')"
            :value-format="optionChainHack(formMeta,['componentAttr','value-format'],'yyyy-MM-dd HH:mm:ss')"
            :default-time="optionChainHack(formMeta,['componentAttr','default-time'],[])"
            :readonly="getCurComponentAttrWithInheritedAttr(formMeta,['componentAttr','readonly'],false)"
            :disabled="optionChainHack(formMeta,['componentAttr','disabled'],false)"
            v-on="optionChainHack(formMeta,['events'],(formItemKey)=>({}))(formMeta.key)"
          />

          <!--  -->
          <el-time-select
            v-if="formMeta.type.startsWith('Time')"
            v-model="syncFormData[formMeta.key]"
            :style="optionChainHack(formMeta,['componentAttr','style'],{})"
            :is-range="optionChainHack(formMeta,['componentAttr','is-range'],false)"
            :placeholder="optionChainHack(formMeta,['componentAttr','placeholder'],'选择时间')"
            :start-placeholder="optionChainHack(formMeta,['componentAttr','start-placeholder'],'开始时间')"
            :end-placeholder="optionChainHack(formMeta,['componentAttr','end-placeholder'],'结束时间')"
            :range-separator="optionChainHack(formMeta,['componentAttr','range-separator'],'至')"
            :value-format="optionChainHack(formMeta,['componentAttr','value-format'],'HH:mm:ss')"
            :default-value="optionChainHack(formMeta,['componentAttr','default-value'],'')"
            :readonly="getCurComponentAttrWithInheritedAttr(formMeta,['componentAttr','readonly'],false)"
            :disabled="optionChainHack(formMeta,['componentAttr','disabled'],false)"
            v-on="optionChainHack(formMeta,['events'],(formItemKey)=>({}))(formMeta.key)"
          />

          <!-- TODO:FIXME:上传组件待做 -->
          <!-- <el-upload
        v-if="formMeta.type==='upload'"
        :file-list="syncFormData[formMeta.key]"
      /> -->

          <!-- 复杂的表单项 比slot更优雅,推荐使用 -->
          <customize-form-item-async-load
            v-else-if="formMeta.type==='CustomizeFormItem'"
            :root-path-type="optionChainHack(formMeta,['rootPathType'],'views')"
            :component-file-path="formMeta.componentFilePath"
            :form-item-key="formMeta.key"
            :component-attr="optionChainHack(formMeta,['componentAttr'],{})"
            :form-data="syncFormData"
            @update:form-data="updateFormData"
            @trigger-validate-form="triggerValidateForm"
            v-on="$listeners"
          />

          <!-- 不推荐不要用 -->
          <slot
            v-else-if="formMeta.type==='FormItemSlot'"
            :name="formMeta.key"
            :form-data="syncFormData"
          />

          <!-- 某些UI要求表单项下面有一些小提示文字 -->
          <div
            v-if="optionChainHack(formMeta,['componentTipObj','text'],'')"
            :style="optionChainHack(formMeta,['componentTipObj','style'],{})"
          >
            {{ formMeta.componentTipObj.text }}
          </div>

        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
import { nullishCoalescingOperator } from './utils'
import eq from 'lodash/eq'
import cloneDeep from 'lodash/cloneDeep'
import CustomizeFormItemAsyncLoad from './customize-form-item-async-load.vue'
// 仅用于 getCurComponentAttrWithInheritedAttr 函数;维护一个列表 强制继承的属性及其值的数组
const forcedInheritedAttrList = [{ disabled: true }, { readonly: true }]

export default {
  name: '',
  components: {
    CustomizeFormItemAsyncLoad
  },
  props: {
    formCommonAttr: {
      type: Object,
      default: () => ({})
    },
    formItemMetaList: {// 表单每一项使用单(多)个 input 、 单(多)个select 还是 单个 ratioGroup
      type: Array,
      require: true,
      default() {
        return [
          {
            // 一个label
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
            rule: []// element的表单校验
            // checkbox-group <el-checkbox-group v-model="checkedCities" @change="handleCheckedChange"><el-checkbox v-for="option in options" :label="option.value" :key="option.value">{{option.label}}</el-checkbox></el-checkbox-group>
          }
        ]
      }
    },
    formData: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      syncFormData: {

      },
      rules: {}
    }
  },
  watch: {
    formData: {
      handler(newVal, oldVal) {
        // 防止死循环
        if (!eq(newVal, this.syncFormData)) {
          // console.log('第一次引用====')
          this.$set(this, 'syncFormData', newVal)
          // this.syncFormData = cloneDeep(newVal);
          // this.syncFormData = newVal;//引用传递;修改子组件表单会自动同步父组件中formData的值//会破坏单向数据流不要用
        }
      },
      immediate: true,
      deep: true
    },
    syncFormData: {
      handler(newVal, oldVal) {
        this.updateFormData(newVal)
      },
      deep: true
    },
    formItemMetaList: {
      handler(newVal, oldVal) {
        // console.log('变了===',newVal);
        newVal.forEach(item => {
          if (item.hasOwnProperty('rule')) {
            this.$set(this.rules, item.key, item.rule)
          } else {
            this.$set(this.rules, item.key, [])
          }
        })
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    updateFormData(val) {
      this.$emit('update:form-data', val)
    },
    /**
     * @param {String|Array} validateTarget
     * validateTarget如果是String,则校验一个字段
     * validateTarget如果是Array,则校验多个字段
     */
    triggerValidateForm(validateTarget) {
      const allValidateFileds = Object.keys(this.rules)

      if (typeof validateTarget === 'string' && allValidateFileds.includes(validateTarget)) {
        this.$refs['RuleFormRef'].validateField(validateTarget)
      } else if (Array.isArray(validateTarget) && validateTarget.every(el => allValidateFileds.includes(el))) {
        validateTarget.forEach(el => {
          this.$refs['RuleFormRef'].validateField(el)
        })
      } else {
        return
      }
    },
    clearValidateForm() {
      // if (this.formItemMetaList.some(el => !!el.rule)) {
      this.$refs['RuleFormRef'].clearValidate()
      // }
    },
    // /////////工具函数/////////////////////
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
     * 先获取继承属性,如果继承属性的属性值为"强制类型",则子组件自带属性失效;否则若子组件存在自带属性,则子组件自带属性优先。
     * 有哪些属性为强制类型: disabled:true、readonly:true
     * 如:disabled、readonly 继承的disabled为true,则子组件的disabled失效
     */
    getCurComponentAttrWithInheritedAttr(obj, attrs, defaultVal) {
      let inheritedAttrVal = defaultVal
      if (attrs.length === 2 && attrs[0] === 'componentAttr') {
        inheritedAttrVal = this.optionChainHack(this.formCommonAttr, [attrs[1]], defaultVal)
      }
      // 读取强制类型值

      const forcedKeyIdx = forcedInheritedAttrList.findIndex((el, idx) => Object.keys(el)[0] === attrs[1] && inheritedAttrVal === el[attrs[1]])
      let forcedInheritedAttrVal
      if (forcedKeyIdx >= 0) {
        forcedInheritedAttrVal = forcedInheritedAttrList[forcedKeyIdx][attrs[1]]
      }
      // 如果强制类型值存在,则后面子组件属性失效
      return forcedInheritedAttrVal ?? this.optionChainHack(obj, attrs, inheritedAttrVal)
      // return nullishCoalescingOperator(forcedInheritedAttrVal,this.optionChainHack(obj, attrs, inheritedAttrVal));
    }
  }
}
</script>

<style scoped>
.readonly-component {
  z-index: -1;
  /* cursor:hand; */
}
</style>
