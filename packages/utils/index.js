/**
 * 判断值具体类型
 * 所有检测类型结果枚举:  "date","regexp","array","object","number","string","null","undefined","function"
 */
 export const u_getTypeof = (val) => {
    const s = Object.prototype.toString.call(val)
    return s.match(/\[object (.*?)\]/)[1].toLowerCase()
  }
/**
 * 前后端请求的字段映射
 * @param {string} target "BackEnd": 分隔符命名 转 小驼峰; "FontEnd": 驼峰 转 分隔符
 * 其中后端 业务接口命名如果有 下划线 用于前端view源码目录层级创建
 * 后端list返回主键统一命名成id;
 *  */
 export function mapKeysToTarget(data, target = "FontEnd", isTree = false, treeProps = {
    hasChildren: 'hasChildren',
    children: 'children'
}) {
    let toFontEndReg = /(?=[A-Z])/;
    let strategy = {
        "FontEnd": (str) => {
            return str.split(toFontEndReg).join("-").toLowerCase();
        },
        "BackEnd": (str) => {
            return str.split('-').map((el, idx) => {
                if (idx > 0) {
                    return el.replace(el[0],el[0].toUpperCase());
                } else {
                    return el;
                }
            }).join('');
        }
    }
    if (u_getTypeof(data) === "object") {
        let orgKeys = Object.keys(data);
        let result = {};
        orgKeys.forEach(key => {
            let newKey = strategy[target](key);
            result[newKey] = data[key];
        })
        return result
    } else if (u_getTypeof(data) === "array" && data.length > 0 && !isTree) {
        let orgKeys = Object.keys(data[0]);
        let results = [];
        data.map(el => {
            let result = {};
            orgKeys.forEach(key => {
                let newKey = strategy[target](key);
                result[newKey] = el[key];
            })
            results.push(result);
        })
        return results
    } else {
        return data
    }

}

// 深拷贝
import cloneDeep from 'lodash/cloneDeep'
export {
    cloneDeep
}