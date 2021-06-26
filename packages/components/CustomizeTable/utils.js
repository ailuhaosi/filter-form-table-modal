import Vue from 'vue'

export const nullishCoalescingOperator = (val, defaultVal) => (val !== null && val !== void 0 ? val : defaultVal)

/**
 * 判断值具体类型
 * 所有检测类型结果枚举:  "date","regexp","array","object","number","string","null","undefined","function"
 */
export const u_getTypeof = (val) => {
  const s = Object.prototype.toString.call(val)
  return s.match(/\[object (.*?)\]/)[1].toLowerCase()
}

/**
 * 对表格某一列设置属性: 清除其它行属性,设置激活行属性
 * @param {Object} targetOrg
 * @param {Number} activedRowIdx //该列的激活行索引,即只激活一个单元格
 * @param {Number} allRowNum
 */
export const u_setActivedRowAttr = (targetOrg, targetActivedComponentInfo) => {
  let newRowAttrs = []
  if (targetOrg.everyRowActivedAttrIdxList.length === 0) {
    newRowAttrs = (new Array(targetActivedComponentInfo.allRowNum)).fill(undefined)
  } else {
    newRowAttrs = [...targetOrg.everyRowActivedAttrIdxList]
  }
  newRowAttrs.splice(targetActivedComponentInfo.activedRowIdx, 1, targetActivedComponentInfo.activedAttrConstListIdx)
  Vue.set(targetOrg, 'everyRowActivedAttrIdxList', newRowAttrs)
}
const TableMetaDataActivedTypes = [
  'Grid-OnlyOne', // 单元格激活(单格);仅允许 当前colKey的列 activedRowIdx所在的行的 单元格 被激活,且 不允许两个单元格激活
  'Row-OnlyOne', // 整行激活(单行);默认;  允许 colKey所在的一整行被激活,且不允许两行被激活
  'Grid-AnyOne', // 单元格激活(多格);允许 当前colKey的列被激活,且允许任何该列的单元格被激活
  'Row-AnyOne', // 整行激活(多行);允许 colKey所在的一整行被激活,且允许任何activedRowIdx的行被激活
  'Col-OnlyOne', // 整列激活(单列)
  'Col-AnyOne' // 整列激活(多列)
]
/**
 * 设置元数据中激活的样式
 * @param {Array} tableHeaderMetaData
 * @param {Number} activedRowIdx 激活样式的行索引;如果为-1,表示移除当前激活行的样式
 * @param {String} activedColKey 事件触发的列的key
 * @param {Number} allRowNum 表格的行数
 */
export const u_setActivedAttrIntoTableMetaData = (tableHeaderMetaData, targetActivedComponentInfo) => {
  let multiComponentIdx = -1
  const multiComponentColIdx = tableHeaderMetaData.findIndex(el => {
    if (el.type === 'MultiComponents' && Array.isArray(el.componentList)) {
      multiComponentIdx = el.componentList.findIndex(multiComponent => multiComponent.key === targetActivedComponentInfo.activedColKey && multiComponent.hasOwnProperty('activedAttrConstList') && multiComponent.hasOwnProperty('everyRowActivedAttrIdxList'))
    }
    return multiComponentIdx !== -1
  })
  let refAllComponentRowAttrs = []
  // 将所有含覆盖样式的targetOrg加入数组
  if (multiComponentIdx !== -1) {
    refAllComponentRowAttrs.push(tableHeaderMetaData[multiComponentColIdx].componentList[multiComponentIdx])
  }
  tableHeaderMetaData.forEach(metaDataRef => {
    if (metaDataRef.hasOwnProperty('activedAttrConstList') && metaDataRef.hasOwnProperty('everyRowActivedAttrIdxList')) {
      refAllComponentRowAttrs.push(metaDataRef)
    }
  })
  // TODO:
  // 有些需求是activedColKey 所在的列才能激活
  if (['Grid-OnlyOne', 'Grid-AnyOne', 'Col-OnlyOne', 'Col-AnyOne'].includes(targetActivedComponentInfo.activedType)) {
    refAllComponentRowAttrs = refAllComponentRowAttrs.filter(refComponent => refComponent.key === targetActivedComponentInfo.activedColKey)
  }
  if (['Grid-OnlyOne', 'Col-OnlyOne'].includes(targetActivedComponentInfo.activedType)) {

  }
  // TODO:
  if (targetActivedComponentInfo.activedType === 'Row-OnlyOne') {
    const curColActivedRefs = refAllComponentRowAttrs.filter(refComponent => refComponent.key === targetActivedComponentInfo.activedColKey)
    // 校验每列元数据的everyRowActivedAttrIdxList;可以是空数组 或者 (数组当前激活行样式与待设置样式不同,且其它有个行已经设置了)---说明不能点击
    const canPass = curColActivedRefs.every(
      refObj =>
        refObj.everyRowActivedAttrIdxList.length === 0 ||
            (refObj.everyRowActivedAttrIdxList.length > 0 &&
                !(refObj.everyRowActivedAttrIdxList[targetActivedComponentInfo.activedRowIdx] !== targetActivedComponentInfo.activedAttrConstListIdx &&
                    refObj.everyRowActivedAttrIdxList.some((el, idx) => idx !== targetActivedComponentInfo.activedRowIdx && el !== 0 && el !== undefined)
                ))
    )
    if (!canPass) {
      console.log('不允许激活两行')
      return false
    }
  }

  // 开始批量覆盖样式
  refAllComponentRowAttrs.forEach(refObj => {
    // console.log(refObj.key)
    u_setActivedRowAttr(refObj, targetActivedComponentInfo)
  })
}

/**
 * 表格、表单的激活属性的设置
 * @param {Array} metaData 表格的列信息即是metaData;表单的footerBlockComponents也是metaData
 * @param {Object} targetActivedComponentInfo
 * 表格:
 * {
 * name:"Table",
 * targetComponentInfo:{
 * name: "Table",
 * activedRowIdx: 0, //Number 激活样式的行索引;如果为-1,表示移除当前激活行的样式
 * activedColKey: '···', //String 事件触发的列的key
 * allRowNum: 10, //Number 表格的行数
 * activedType: "AllCol" // String;一共两种:"AllCol"、"CurCol"
 * activedAttrConstListIdx: 0 //Number;即属性常量表的索引
 * }
 * 表单:
 * {
 * name:"Form",
 * activedKey: '···' //String
 * activedAttrConstListIdx: 0 //Number;即属性常量表的索引
 * }
 */
export const u_setActivedAttrIntoMetaData = (metaData, targetActivedComponentInfo) => {
  const strategys = {
    'Table': u_setActivedAttrIntoTableMetaData
  }
  strategys[targetActivedComponentInfo.name](metaData, targetActivedComponentInfo)
}

/**
 * 将树形数据的key换个别名, 同时将值使用 formatters 中的函数转化
 */
export const u_transTreeList = (orgTreeList, mapKeys = {}, treeProp = {
  hasChildren: 'hasChildren',
  children: 'children'
}, formatters = {}) => {
  function mapTree(orgTreeObj) {
    const childrenKey = treeProp.children
    const haveChildren = orgTreeObj[childrenKey] && Array.isArray(orgTreeObj[childrenKey]) && orgTreeObj[childrenKey].length > 0
    const changedObj = {}
    Object.keys(mapKeys).forEach(oldkey => {
      if (oldkey !== childrenKey) {
        let val = null
        if (typeof formatters[oldkey] === 'function') {
          val = formatters[oldkey](orgTreeObj[oldkey])
        } else {
          val = orgTreeObj[oldkey]
        }
        changedObj[mapKeys[oldkey]] = val
      }
    })
    if (haveChildren) {
      return {
        // 分别将我们查询出来的值做出改变他的key
        ...changedObj,
        /* data: {
                    ...orgTreeObj
                }, */
        // 判断它是否存在子集，若果存在就进行再次进行遍历操作，知道不存在子集便对其他的元素进行操作
        [childrenKey]: orgTreeObj[childrenKey].map(i => mapTree(i))
      }
    } else {
      return {
        // 分别将我们查询出来的值做出改变他的key
        ...changedObj
        /* data: {
                    ...orgTreeObj
                }, */
      }
    }
  }
  return orgTreeList.map(orgTreeObj => mapTree(orgTreeObj))
}

/**
 * 将树形数据扁平化成数组
 */
export const u_getFlattenTreeList = (arr, treeProp = {
  hasChildren: 'hasChildren',
  children: 'children'
}) => {
  const childrenKey = treeProp.children
  const result = []
  const flattenTreeSetResult = (arr, result, levelPreFix = '') => {
    arr.forEach((item, idx) => {
      const curLevel = `${levelPreFix}${idx + 1}`
      // item[`level-${this[mixins_tableCommonAttrAlias]['row-key']}`] = curLevel;
      if (item[childrenKey]) {
        const rowObj = {
          ...item
        }
        delete rowObj[childrenKey]
        result.push(rowObj)
        flattenTreeSetResult(item[childrenKey], result, `${curLevel}-`)
      } else {
        result.push({
          ...item
        })
      }
    })
  }
  flattenTreeSetResult(arr, result)
  return result
}
