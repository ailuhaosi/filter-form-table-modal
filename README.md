# FilterFormTableModal
## 介绍
1. 业务痛点：后台管理项目基本结构比较固定，分为“过滤表单”、“表格”、“弹窗表单”等，往往页面相似，且各种事件、组件联动等写法会五花八门，后期维护效率低下。
2. 解决方案：`FilterFormTableModal`组件，基于json配置(样式 和 事件)即可实现页面，且可高度定制，配合代码生成器(code-gen)可大大减轻工作量。
## 特点
### 内置组件
组件支持表单Item，表格ceil，还是都支持见下表：
| 组件类型      | 支持(Form、Table、All) |
| :---------: | :---------: |
| `Input`      | All  |
| `Select` | All    |
| `Switch` | All |
| `CheckboxGroup` | Form |
| `RadioGroup` | Form |
| `DatePicker` | Form |
| `TimePicker` | Form |
| `CustomizeFormItem` | Form |
| `MatchMapVal` | Table |
| `SingleSelection` | Table |
| `Avatar` | Table |
| `CustomizeTableCeil` | Table |

## Project setup
文档尚未完善，具体使用请参考examples文件夹
