<template>
  <div v-if="canUse">
    <div ref="CustomizeFormItemAsyncLoadRef" />
  </div>
</template>
<script>
import eq from 'lodash/eq'
import cloneDeep from 'lodash/cloneDeep'
import Vue from 'vue'
// TODO:需要考虑自定义组件 修改传入的formData时触发事件;自定义组件的events应该也是动态传入的
export default {
  name: 'CustomizeFormItemAsyncLoad',
  props: {
    /**
     * componentFilePath 必须属于 @/views/ 路径下面的子路径
     */
    componentFilePath: {
      type: String,
      require: true
    },
    rootPathType: {
      type: String,
      default: 'views'
    },
    formItemKey: {
      type: String,
      require: true
    },
    componentAttr: {
      type: Object,
      // require: true,
      default: () => ({})
    },
    formData: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      customizeFormItemInstance: null,
      canUse: true
    }
  },
  computed: {
    changedAnyProps() {
      const { componentFilePath, rootPathType, formItemKey, componentAttr, formData } = this
      return { componentFilePath, rootPathType, formItemKey, componentAttr, formData }
    }
  },
  watch: {
    changedAnyProps: {
      handler(newVal, oldVal) {
        this.changeComponent(oldVal)
        this.retransProps(['formItemKey', 'componentAttr', 'formData'], newVal)
      },
      deep: true
    }
  },
  created() {
    this.startDynmicLoadComponent()
  },
  // 卸载手动监听的变量
  beforeDestroy() {
    this.destroyDynmicLoadComponent()
  },
  methods: {
    // 旧props与当前props比较,如果不同则 说明组件改变,需重新挂载;
    changeComponent(changedAnyPropsNewVal) {
      if (!eq(changedAnyPropsNewVal.formItemKey, this.formItemKey) || !eq(changedAnyPropsNewVal.componentFilePath, this.componentFilePath) || !eq(changedAnyPropsNewVal.rootPathType, this.rootPathType)) {
        if (this.canUse) {
          this.destroyDynmicLoadComponent()
          this.canUse = false
          this.$nextTick(() => {
            this.canUse = true
            this.startDynmicLoadComponent()
          })
        }
      }
    },
    // 组件不变,只改变传递的属性;修复 propsData 不能动态
    retransProps(props, changedAnyPropsNewVal) {
      // 如果是动态组件本身在变 componentFilePath, rootPathType 变化, 不用去执行后面
      if (!this.canUse) {
        return
      }
      props.forEach(prop => {
        if (!eq(changedAnyPropsNewVal[prop], this.customizeFormItemInstance.$props[prop])) {
          this.customizeFormItemInstance.$props[prop] = changedAnyPropsNewVal[prop]
        }
      })
    },
    registerComponent() {
      if (this.rootPathType === 'components') {
        return Promise.resolve(require(`@/components/${this.componentFilePath}`))
      } else {
        return Promise.resolve(require(`@/views/${this.componentFilePath}`))
      }
    },
    startDynmicLoadComponent() {
      this.registerComponent().then(component => {
        const customizeFormItemConstructor = Vue.extend(component.default)
        this.customizeFormItemInstance = new customizeFormItemConstructor({
          el: this.$refs['CustomizeFormItemAsyncLoadRef'],
          propsData: {
            formItemKey: this.formItemKey,
            componentAttr: this.componentAttr,
            formData: this.formData
          }
        })
        // 来自动态组件的更新
        this.customizeFormItemInstance.$on('update:form-data', (val) => {
          this.$emit('update:form-data', val)
        })
        // 来自动态组件的表单校验
        this.customizeFormItemInstance.$on('trigger-validate-form', (val) => {
          this.$emit('trigger-validate-form', val)
        })
        // 来自动态组件的复杂事件逻辑,需要统一分发到 doFormOperationStrategy 中执行
        // 比如,要把另一个formItem从type=Input变成type=Select等,需要修改formItemMetaList的情况;
        // 比如,需要关闭弹窗、提交表单,需要 后缀'ClearDialogVisible'、前缀'Valid'等
        this.customizeFormItemInstance.$on('do-operation', (...args) => {
          const [emitName, eventFromKey] = args
          // console.log(emitName, eventFromKey);
          this.$emit('do-operation', ...args)
        })
      }).catch(err => {
        console.log(err)
      })
    },
    destroyDynmicLoadComponent() {
      if (this.customizeFormItemInstance) {
        this.customizeFormItemInstance.$off()
        this.customizeFormItemInstance = null
      }
    }
  }
}
</script>
<style></style>
