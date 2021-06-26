<template>
  <div v-if="canUse">
    <div ref="CustomizeTableCeilAsyncLoadRef"></div>
  </div>
</template>
<script>
import eq from 'lodash/eq';
import cloneDeep from 'lodash/cloneDeep'
import Vue from "vue";
export default {
  name: "CustomizeTableCeilAsyncLoad",
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
      default: "views"
    },
    /**
     * 如果是 'MultiComponents' 则用 逗号 分隔
      */
    tableCeilKey: {
      type: String,
      require: true
    },
    componentAttr: {
      type: Object,
      //require: true,
      default: () => ({})
    },
    /**
     * 当前渲染的行数据
     *  */
    rowData: {
      type: Object,
      require: true
    },
    /**
     * 表格行索引
      */
    rowIdx: {
      type: Number,
      require: true
    }
  },
  data () {
    return {
      customizeTableCeilInstance: null,
      canUse: true
    }
  },
  computed: {
    changedAnyProps () {
      const { componentFilePath, rootPathType, tableCeilKey, componentAttr, rowData, rowIdx } = this;
      return { componentFilePath, rootPathType, tableCeilKey, componentAttr, rowData, rowIdx }
    }
  },
  watch: {
    changedAnyProps: {
      handler (newVal, oldVal) {
        this.changeComponent(oldVal);
        this.retransProps(['tableCeilKey', 'componentAttr', 'rowData', 'rowIdx'], newVal);
      },
      deep: true
    },
  },
  methods: {
    // 旧props与当前props比较,如果不同则 说明组件改变,需重新挂载;
    changeComponent (changedAnyPropsNewVal) {
      if (!eq(changedAnyPropsNewVal.tableCeilKey, this.tableCeilKey) || !eq(changedAnyPropsNewVal.componentFilePath, this.componentFilePath) || !eq(changedAnyPropsNewVal.rootPathType, this.rootPathType)) {
        if (this.canUse) {
          this.destroyDynmicLoadComponent();
          this.canUse = false
          this.$nextTick(() => {
            this.canUse = true
            this.startDynmicLoadComponent();
          })
        }
      }
    },
    //组件不变,只改变传递的属性;修复 propsData 不能动态
    retransProps (props, changedAnyPropsNewVal) {
      // 如果是动态组件本身在变 componentFilePath, rootPathType 变化, 不用去执行后面
      if (!this.canUse) {
        return;
      }
      props.forEach(prop => {
        if (!eq(changedAnyPropsNewVal[prop], this.customizeTableCeilInstance.$props[prop])) {
          this.customizeTableCeilInstance.$props[prop] = changedAnyPropsNewVal[prop];
        }
      })
    },
    registerComponent () {
      if (this.rootPathType === "components") {
        return Promise.resolve(require(`@/components/${this.componentFilePath}`))
      } else {
        return Promise.resolve(require(`@/views/${this.componentFilePath}`))
      }
    },
    startDynmicLoadComponent () {
      this.registerComponent().then(component => {
        const customizeTableCeilConstructor = Vue.extend(component.default);
        this.customizeTableCeilInstance = new customizeTableCeilConstructor({
          el: this.$refs["CustomizeTableCeilAsyncLoadRef"],
          propsData: {
            tableCeilKey: this.tableCeilKey,
            componentAttr: this.componentAttr,
            rowData: this.rowData,
            rowIdx: this.rowIdx
          }
        });
        // 来自动态组件的更新
        this.customizeTableCeilInstance.$on('update:row-data', (val) => {
          this.$emit("update:row-data", val);
        });

        // 来自动态组件的复杂事件逻辑,需要统一分发到 doTableOperationStrategy 中执行
        this.customizeTableCeilInstance.$on('do-operation', (...args) => {
          this.$emit("do-operation", ...args);
        });
      }).catch(err => {
        console.log(err)
      });

    },
    destroyDynmicLoadComponent () {
      if (this.customizeTableCeilInstance) {
        this.customizeTableCeilInstance.$off();
        this.customizeTableCeilInstance = null;
      }
    }
  },
  created () {
    this.startDynmicLoadComponent()
  },
  //卸载手动监听的变量
  beforeDestroy () {
    this.destroyDynmicLoadComponent();
  }
}
</script>
<style></style>