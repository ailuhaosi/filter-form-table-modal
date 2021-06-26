<template>
  <div>
    <template v-for="(component,idx) in blockComponents">
      <el-button
        v-if="optionChainHack(component,['type'],'Button')==='Button' && operationBtnType===optionChainHack(component,['operationBtnType'],'common-operation-btn')"
        v-show="optionChainHack(component,['isShow'],true)"
        :key="component.key"
        :class="component.key"
        :type="getComponentAttrVal(component,['componentAttr','type'],'primary')"
        :plain="getComponentAttrVal(component,['componentAttr','plain'],false)"
        :style="getComponentAttrVal(component,['componentAttr','style'],{})"
        v-on="optionChainHack(component,['events'],(eventFromKey)=>({}))(component.key)"
      >
        <i
          v-if="getComponentAttrVal(component,['componentAttr','icon','place'],'left')==='left'"
          :class="getComponentAttrVal(component,['componentAttr','icon','class'],'')"
        />
        {{ getComponentAttrVal(component,['componentAttr','textVal'],'') }}
        <i
          v-if="getComponentAttrVal(component,['componentAttr','icon','place'],'left')==='right'"
          :class="getComponentAttrVal(component,['componentAttr','icon','class'],'')"
        />
      </el-button>
    </template>
  </div>
</template>

<script>
import { nullishCoalescingOperator } from './utils'
export default {
  name: 'FooterBlockComponents',
  props: {
    /*
    event.emitName: 可以是   以 ClearDialogVisible 结尾、以 Valid 开头
    */
    operationBtnType: {
      type: String,
      default: 'common-operation-btn'
    },
    blockComponents: {
      type: Array,
      default: () => {
        return [{
          key: 'More', // 注意与 formMeta.key 均不同
          event: {
            emitType: 'click',
            emitName: 'CancelThenClearDialogVisible' // "Submit","Cancel"
          },
          componentAttr: {// 组件属性
            type: 'text',
            textVal: '更多',
            icon: {
              class: 'el-icon-arrow-down',
              place: 'left'
            }
          }
        }, {
          key: 'Cancel', // 注意与 formMeta.key 均不同
          event: {
            emitType: 'click',
            emitName: 'CancelThenClearDialogVisible'
          },
          componentAttr: {// 组件属性
            type: 'warning',
            textVal: '取消'
          }
        }, {
          key: 'ValidSubmit', // 注意与 formMeta.key 均不同
          event: {
            emitType: 'click',
            emitName: 'ValidSubmitThenClearDialogVisible'
          },
          componentAttr: {// 组件属性
            type: 'primary',
            textVal: '提交',
            icon: {
              class: 'el-icon-upload',
              place: 'left'
            }
          }
        }]
      }
    }
  },
  data() {
    return {

    }
  },
  methods: {
    doOperation(emitName, eventFromKey) {
      this.$emit('doOperation', emitName, eventFromKey)
    },
    // ////////////固定的工具方法/////////////////////////////
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
    setInheritAttrIntoComponent() {

    },
    /**
     * 分为 事件激活属性、组件自带属性;如果前者存在,则后者不会体现会把覆盖。
     * 设置当前组件的属性值: 先继承列的通用属性,再用当前行具体属性去覆盖
     * @param {Number} rowNum
     * @param {object} obj 原始对象
     * @param {Array} attars 按层级次序的属性数组
     * @param {any} defaultVal 默认值
     */
    getComponentAttrVal(obj, attrs, defaultVal) {
      // 读取继承属性
      const inheritAttrVal = this.optionChainHack(obj, attrs, defaultVal)

      // 读取当前组件的事件激活的属性值
      let eventActivedAttrVal
      const curActivedAttrIdx = obj?.curActivedAttrIdx
      if (curActivedAttrIdx !== undefined) {
        const [, ...curAttrs] = attrs
        eventActivedAttrVal = this.optionChainHack(obj.activedAttrConstList[curActivedAttrIdx], curAttrs, undefined)
      }
      /* if (obj.type === 'MatchMapVal') {
        console.log('最终====', curRowAttrVal,obj?.curRowAttr(row, rowIdx))
      } */
      // return eventActivedAttrVal ?? inheritAttrVal;
      return nullishCoalescingOperator(eventActivedAttrVal, inheritAttrVal)
    }
  }
}
</script>

<style>
</style>
