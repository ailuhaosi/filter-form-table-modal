import cloneDeep from 'lodash/cloneDeep'
import {
    Sortable,
    MultiDrag
} from 'sortablejs';
let mixins_sortableTreeTable = null;
export default (config = {}) => {
    let {
        //绑定在this上的别名、ref的别名 等
        mixins_tableCommonAttrAlias = "tableCommonAttr", //表格通用属性的别名
            //mixins_treeTableExpandedIdsAlias = "treeTableExpandedIds",
            mixins_tableBodyDataAlias = "tableBodyData", //表格数据数组的别名
            mixins_CustomizeTableRefAlias = "CustomizeTableRef", //表格ref的别名
            //常量 或 函数
            mixins_SortablejsConfigObj = {},
            mixins_allowSortableType = "Default", //允许拖放的类型//默认不允许父级拖放至子级的子级
            mixins_OnChange = (evt) => {},
            mixins_OnSort = undefined
    } = config;
    //初始化sortable配置信息
    mixins_SortablejsConfigObj = {
        disable: (config.mixins_SortablejsConfigObj === undefined || config.mixins_SortablejsConfigObj.disable === undefined) ? false : config.mixins_SortablejsConfigObj.disable,
        handle: (config.mixins_SortablejsConfigObj === undefined) ? '.drag-btn' : config.mixins_SortablejsConfigObj.handle, //  || config.mixins_SortablejsConfigObj.handle === undefined
        //draggable: ".edit-btn",
        //selectedClass: "high-light-row",
        ghostClass: (config.mixins_SortablejsConfigObj === undefined || config.mixins_SortablejsConfigObj.ghostClass === undefined) ? 'sortable-ghost' : config.mixins_SortablejsConfigObj.ghostClass, // 被拖拽的item的样式,拖拽过程中的样式一旦drop成功则还原
        forceFallback: (config.mixins_SortablejsConfigObj === undefined || config.mixins_SortablejsConfigObj.forceFallback === undefined) ? true : config.mixins_SortablejsConfigObj.forceFallback, //去掉h5默认的拖拽方式
        //dragoverBubble: (config.mixins_SortablejsConfigObj === undefined || config.mixins_SortablejsConfigObj.dragoverBubble === undefined) ? true : config.mixins_SortablejsConfigObj.dragoverBubble, //实现树形拖放,拖动父级可以把子级带上
    }

    return {
        data() {
            return {
                mixins_willInsertAfter: true,
                mixins_hasCalledSetSortMethod: false, //解决 自定义表格单元格 type='CustomizeTableCeil'时,拖拽无法使用的问题
                mixins_curSelectedTreeRowIdxs: []
            }
        },
        computed: {
            /**
             * 仅扁平化可见表格行的数据 所有的展开行、顶级行
             * FIXME:目前数组返回次序按照el-row顺序
             */
            mixins_getFlattenCurShowRowTableBodyData() {
                if (this[mixins_tableBodyDataAlias].length === 0 || this[mixins_tableCommonAttrAlias]['row-key'] === undefined) {
                    return []
                }
                //扁平化所有树形表格数据
                let result = this.mixins_getFlattenTreeList(this[mixins_tableBodyDataAlias]);
                //顶层级可见
                const topLevelIds = this[mixins_tableBodyDataAlias].map(el => el[this[mixins_tableCommonAttrAlias]['row-key']]);
                // 展开行的直接子层级可见
                let expandedSonIds = this.mixins_getExpandedTreeSonIds(this[mixins_tableBodyDataAlias]);
                let filterIds = [...topLevelIds, ...expandedSonIds];
                result = result.filter(row => filterIds.includes(row[this[mixins_tableCommonAttrAlias]['row-key']]));
                return result;
            },
            /**
             * 扁平化 所有的表格数据
             * FIXME:目前数组返回次序按照el-row顺序
             */
            mixins_getFlattenAllRowTableBodyData() {
                console.log('----已经重置表格数据--------')
                if (this[mixins_tableBodyDataAlias].length === 0 || this[mixins_tableCommonAttrAlias]['row-key'] === undefined) {
                    return []
                }
                //扁平化所有树形表格数据
                let result = this.mixins_getFlattenTreeList(this[mixins_tableBodyDataAlias]);
                return result;
            },
            mixins_getChildrenKey() {
                let childrenKey = this[mixins_tableCommonAttrAlias]['tree-props'] && this[mixins_tableCommonAttrAlias]['tree-props'].children;
                if (childrenKey === undefined) {
                    childrenKey = "children"
                }
                return childrenKey;
            }
        },
        methods: {
            /**
             * 扁平化所有树形表格数据的数组
             */
            mixins_getFlattenTreeList(arr) {
                let childrenKey = this.mixins_getChildrenKey;
                let result = [];
                let flattenTreeSetResult = (arr, result, levelPreFix = '') => {
                    arr.forEach((item, idx) => {
                        const curLevel = `${levelPreFix}${idx + 1}`;
                        item[`level-${this[mixins_tableCommonAttrAlias]['row-key']}`] = curLevel;
                        if (item[childrenKey]) {
                            let rowObj = {
                                ...item
                            };
                            delete rowObj[childrenKey]
                            result.push(rowObj);
                            flattenTreeSetResult(item[childrenKey], result, `${curLevel}-`)
                        } else {
                            result.push({
                                ...item
                            });
                        }
                    })
                }
                flattenTreeSetResult(arr, result);
                return result
            },
            /**
             * 展开行的直接子层级的ids数组
             */
            mixins_getExpandedTreeSonIds(arr) {
                let childrenKey = this.mixins_getChildrenKey;
                let resultIds = [];
                let flattenTreeSetIds = (arr, resultIds, pid) => {
                    arr.forEach((item) => {
                        let id = item[this[mixins_tableCommonAttrAlias]['row-key']];
                        if (this.$refs[mixins_CustomizeTableRefAlias].treeTableExpandedIds.includes(pid)) {
                            resultIds.push(id);
                        }
                        if (item[childrenKey]) {
                            pid = id;
                            flattenTreeSetIds(item[childrenKey], resultIds, pid)
                        }
                    })
                }
                flattenTreeSetIds(arr, resultIds, undefined);
                return resultIds;
            },
            /**
             * 根据两个id判断他们在树形结构中的关系
             * NotAllow 父亲变成儿子的儿子 默认不允许
             * @returns {String} relation: 为 "All" "Default" 中的一种
             * 
             */
            mixins_getLevelRelationByRowData(pickedRow, targetRow) {
                const pickedLevel = pickedRow[`level-${this[mixins_tableCommonAttrAlias]['row-key']}`];
                const targetLevel = targetRow[`level-${this[mixins_tableCommonAttrAlias]['row-key']}`];
                if (targetLevel.startsWith(pickedLevel)) { //此种情况只有在All时才能允许
                    return "All"
                } else {
                    return "Default"
                }
            },
            /**
             * 获取当前选中行及其子级
             */
            mixins_getSelectedRowIdxs(curRowIndex) {
                const pickedRow = this.mixins_getFlattenAllRowTableBodyData[curRowIndex];
                const pickedLevel = pickedRow[`level-${this[mixins_tableCommonAttrAlias]['row-key']}`];
                let selectedRowIdxs = [];
                this.mixins_getFlattenAllRowTableBodyData.forEach((rowData, rowIdx) => {
                    if (rowData[`level-${this[mixins_tableCommonAttrAlias]['row-key']}`].startsWith(pickedLevel)) {
                        selectedRowIdxs.push(rowIdx)
                    }
                });
                //console.log(selectedRowIdxs, 'kkkkkkk')
                return selectedRowIdxs
            },
            mixins_hackDispatchEvent(el, type) {
                try {
                    let evt = document.createEvent('MouseEvent');
                    evt.initMouseEvent(type, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    el.dispatchEvent(evt);
                } catch (e) {
                    //alert(e)
                    console.log(e)
                };
            },
            mixins_resetListenTreeSelect(pickedRowIdx) {
                this.mixins_setListenTreeSelect();
                let el = this.$refs[mixins_CustomizeTableRefAlias].$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
                let trNodes = Array.from(el.children);
                //获取当前项及其子树项
                const selectedRowIds = this.mixins_getSelectedRowIdxs(pickedRowIdx);
                this.mixins_curSelectedTreeRowIdxs = selectedRowIds;
                trNodes.forEach((el, rowIdx) => {
                    if (selectedRowIds.includes(rowIdx)) {
                        //el.click();
                        Sortable.utils.select(el)
                    } else {
                        Sortable.utils.deselect(el)
                    }
                })

            },
            mixins_execTreeSelect(pickedRowIdx) {
                console.log('====鼠标悬浮,当前项及其子树都被选中====')
                let el = this.$refs[mixins_CustomizeTableRefAlias].$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
                let trNodes = Array.from(el.children);
                //console.log(trNodes)
                //获取当前项及其子树项
                const selectedRowIds = this.mixins_getSelectedRowIdxs(pickedRowIdx);
                this.mixins_curSelectedTreeRowIdxs = selectedRowIds;
                trNodes.forEach((el, rowIdx) => {
                    if (selectedRowIds.includes(rowIdx)) {
                        //el.click();
                        Sortable.utils.select(el)
                    } else {
                        Sortable.utils.deselect(el)
                    }
                })
            },
            mixins_setListenTreeSelect() {
                const el = this.$refs[mixins_CustomizeTableRefAlias].$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
                let domXpath = "";
                mixins_SortablejsConfigObj.handle ? domXpath = `tr ${mixins_SortablejsConfigObj.handle}` : domXpath = 'tr';
                el.querySelectorAll(domXpath).forEach((pickedRowEl, pickedRowIdx) => {
                    //TODO:FIXME: mouseover  与   onEnd/onUnchoose 时候 都调用一次、封装 onSort 逻辑,[接收参数 重排后的扁平化数组---->返回值 整理后的tree数据]
                    pickedRowEl.addEventListener("mouseover", () => {
                        this.mixins_execTreeSelect(pickedRowIdx)
                    });
                });
            },
            mixins_removeListenTreeSelect() {
                const el = this.$refs[mixins_CustomizeTableRefAlias].$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
                let domXpath = "";
                mixins_SortablejsConfigObj.handle ? domXpath = `tr ${mixins_SortablejsConfigObj.handle}` : domXpath = 'tr';
                el.querySelectorAll(domXpath).forEach((pickedRowEl, pickedRowIdx) => {
                    pickedRowEl.removeEventListener("mouseover", () => {
                        this.mixins_execTreeSelect(pickedRowIdx)
                    }, true)
                });
                this.mixins_curSelectedTreeRowIdxs = [];
            },
            mixins_transListToTree(curList) {
                //`level-${this[mixins_tableCommonAttrAlias]['row-key']}`
            },
            //表格拖拽设置
            mixins_setSort() {
                const el = this.$refs[mixins_CustomizeTableRefAlias].$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
                this.mixins_setListenTreeSelect();
                //console.log('======created sort========')
                Sortable.mount(new MultiDrag());
                mixins_sortableTreeTable = Sortable.create(el, {
                    ...mixins_SortablejsConfigObj,
                    animation: 150,
                    multiDrag: true,
                    selectedClass: "sortable-selected",
                    multiDragKey: 'CTRL', //不填默认是点击选中
                    //dragoverBubble: true, //实现树形拖放
                    //pickedRow变为targetRow的兄弟层级
                    setData: function(dataTransfer, dragEl) {
                        //dataTransfer.setData('Text', dragEl.textContent); // `dataTransfer` object of HTML5 DragEvent
                        console.log("setData")
                    },
                    onChoose: (evt) => {
                        console.log('onChoose鼠标按下===', evt.oldIndex);
                        //TODO:FIXME:移除mouseover监听
                        this.mixins_removeListenTreeSelect();
                    },
                    onStart: function(evt) {
                        //console.log("onStart")
                    },
                    onUnchoose: (evt) => {
                        console.log('鼠标松开===', evt.oldIndex);
                        this.mixins_resetListenTreeSelect(evt.oldIndex);
                        //Sortable.utils.select(Array.from(el.childNodes)[2])
                    },
                    //TODO:FIXME: 监听鼠标移入拖拽区域 执行双击后,下面的逻辑才能正常执行
                    onSelect: (evt) => {
                        //console.log('选中==', evt.item);
                    },
                    onDeselect: (evt) => {
                        //console.log('删除==', evt.item)
                    },
                    onMove: (evt) => {
                        //console.log('放置位置===', evt.dragged.rowIndex, evt.related.rowIndex);
                        this.mixins_willInsertAfter = evt.willInsertAfter;
                        return true
                    },
                    //FIXME:注: 拖拽的鼠标样式修改在开发者工具打开下不生效,这是浏览器bug
                    onChange: (evt) => {
                        let oldId = evt.oldIndex,
                            newId = evt.newIndex;
                        const beforeChangedFlattenShowRowTableBodyDataList = this.mixins_getFlattenAllRowTableBodyData;
                        //console.log('======', beforeChangedFlattenShowRowTableBodyDataList);
                        const curNeedAllowType = this.mixins_getLevelRelationByRowData(beforeChangedFlattenShowRowTableBodyDataList[oldId], beforeChangedFlattenShowRowTableBodyDataList[newId]);
                        /////////////解决class中鼠标状态的属性不存在情况
                        if (this[mixins_tableCommonAttrAlias].class === undefined) {
                            this.$set(this[mixins_tableCommonAttrAlias], 'class', {
                                'customize-table-not-dropped-status': false
                            });
                        } else if (this[mixins_tableCommonAttrAlias].class['customize-table-not-dropped-status'] === undefined) {
                            this.$set(this[mixins_tableCommonAttrAlias], 'class', {
                                'customize-table-not-dropped-status': false,
                                ...this[mixins_tableCommonAttrAlias]
                            });
                        }
                        //////////////
                        if (mixins_allowSortableType !== curNeedAllowType) {
                            this.$set(this[mixins_tableCommonAttrAlias].class, 'customize-table-not-dropped-status', true);
                        } else {
                            this.$set(this[mixins_tableCommonAttrAlias].class, 'customize-table-not-dropped-status', false);
                        }
                        mixins_OnChange(evt);
                    },
                    //FIXME:注: 拖拽的鼠标样式修改在开发者工具打开下不生效,这是浏览器bug
                    onSort: (evt) => {
                        let oldId = evt.oldIndex,
                            newId = evt.newIndex,
                            reArrange = mixins_sortableTreeTable.toArray(),
                            oldSort = mixins_sortableTreeTable.toArray();

                        if (oldId < newId) { //向下移动
                            for (var i = oldId; i < newId; i++)
                                reArrange[i + 1] = oldSort[i];
                        } else { //向上移动
                            for (var i = newId + 1; i <= oldId; i++)
                                reArrange[i - 1] = oldSort[i];
                        }
                        //不允许拖放,排序还原
                        if (this[mixins_tableCommonAttrAlias].class['customize-table-not-dropped-status']) {
                            reArrange[oldId] = oldSort[newId];
                            mixins_sortableTreeTable.sort(reArrange);
                        } else {
                            //自定义的成功排序逻辑
                            if (mixins_OnSort !== undefined) {
                                mixins_OnSort(evt);
                                return;
                            }
                            //TODO:FIXME:
                            //this.mixins_curSelectedTreeRowIdxs
                            //newId
                            //this.mixins_willInsertAfter
                            // this.mixins_getFlattenAllRowTableBodyData
                            //TODO:FIXME:
                            //通常的成功排序逻辑
                            //允许拖放,触发tableBodyData重排
                            //1. 先计算重排后的tableBodyData的数据
                            //console.log('=========', oldId, newId);
                            let orgTableBodyData = cloneDeep(this[mixins_tableBodyDataAlias]);
                            const beforeChangedFlattenShowRowTableBodyDataList = this.mixins_getFlattenAllRowTableBodyData;
                            const pickedLevel = beforeChangedFlattenShowRowTableBodyDataList[oldId][`level-${this[mixins_tableCommonAttrAlias]['row-key']}`];
                            const targetLevel = beforeChangedFlattenShowRowTableBodyDataList[newId][`level-${this[mixins_tableCommonAttrAlias]['row-key']}`];
                            const pickedLevelSplitArr = pickedLevel.split('-');
                            const targetLevelSplitArr = targetLevel.split('-');
                            let pickedBodyData = {};
                            let tempData = orgTableBodyData; //所有对tempData的修改,都会在orgTableBodyData上生效
                            //备份当前拖拽行及其子树,并删除
                            pickedLevelSplitArr.forEach((el, idx) => {
                                if (pickedLevelSplitArr.length - 1 > idx) {
                                    tempData = tempData[+el - 1][this.mixins_getChildrenKey];
                                } else {
                                    pickedBodyData = cloneDeep(tempData[+el - 1]);
                                    tempData.splice(+el - 1, 1);
                                }
                            });

                            const pickedLevelPreFixSplitArr = pickedLevelSplitArr.slice(0, -1);
                            const pickedLevelPreFix = pickedLevelPreFixSplitArr.join('-');
                            //(拖动元素 与 目标元素的直链祖先 是 兄弟关系) 且 (拖动元素 是 哥哥) 时,目标元素层级会-1,即后退1个;需要根据插入前后
                            if (targetLevel.startsWith(pickedLevelPreFix) && +pickedLevelSplitArr[pickedLevelSplitArr.length - 1] < +targetLevelSplitArr[pickedLevelSplitArr.length - 1]) {
                                targetLevelSplitArr[pickedLevelSplitArr.length - 1] -= 1;
                            }
                            //重置tempData
                            tempData = orgTableBodyData;
                            targetLevelSplitArr.forEach((el, idx) => {
                                if (targetLevelSplitArr.length - 1 > idx) {
                                    tempData = tempData[+el - 1][this.mixins_getChildrenKey];
                                } else {
                                    if (this.mixins_willInsertAfter) { //后插入
                                        tempData.push(pickedBodyData);
                                    } else { //前插入
                                        tempData.splice(+el - 1, 0, pickedBodyData);
                                    }
                                }
                            });
                            //2. 正式设置tableBodyData重新排序
                            this.$nextTick(() => {
                                console.log('开始重置表格数据')
                                //TODO:FIXME: 这里暂时去掉了
                                //this.$set(this, mixins_tableBodyDataAlias, orgTableBodyData);
                            })
                        }
                    },
                    onEnd: async (evt) => {
                        this.$set(this[mixins_tableCommonAttrAlias].class, 'customize-table-not-dropped-status', false);
                    }
                })
            },
            //解决 自定义表格单元格 type='CustomizeTableCeil'时,拖拽无法使用的问题
            mixins_callSetSort() {
                if (!this.mixins_hasCalledSetSortMethod) {
                    this.mixins_hasCalledSetSortMethod = true;
                    this.$nextTick(() => {
                        this.mixins_hasCalledSetSortMethod = false;
                        this.mixins_setSort()
                    });
                }
            }
        }
    }
}