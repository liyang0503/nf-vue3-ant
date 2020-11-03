/* 查询控件，处理控件的值和属性 */
import { reactive, watch, getCurrentInstance } from 'vue'

export function manageFindData (props) {
  // props 组件参数
  // 上下文，向父组件传值用
  const { ctx } = getCurrentInstance()

  // 查询方式的字典， 内容不会变，不监控
  const dicFindKind = {
    401: '=', // 字符串
    402: '≠',
    403: '含',
    404: '不含',
    405: '起始',
    406: '结束', // 字符串

    411: '=', // 数字
    412: '≠',
    413: '>',
    414: '≥',
    415: '<',
    416: '≤',
    417: '从', // 范围

    421: '=', // 日期、年月、年周
    422: '≠',
    423: '>',
    424: '≥',
    425: '<',
    426: '≤',
    427: '从', // 范围

    431: '=', // 时间
    432: '≠',
    433: '>',
    434: '≥',
    435: '<',
    436: '≤',
    437: '从', // 范围

    441: 'in'
  }

  // 查询方式，其实前端不需要的
  const dicFindWhere = {
    401: ' = "{k}"',
    402: ' <> "{k}"',
    403: ' like "%{k}%"',
    404: ' not like "%{k}%"',
    405: ' like "{k}%"',
    406: ' like "%{k}"',
    411: ' ={k}',
    412: ' <>{k}',
    413: ' >{k}',
    414: ' >={k}',
    415: ' <{k}',
    416: ' <={k}',
    421: ' ="{k}"',
    431: ' between {k1} and {k2}',
    432: ' between "{k1}" and "{k2}" ',
    433: ' in ({k})'
  }

  // 查询现实方面用的属性
  const findDataInfo = reactive(
    {
      antSize: 'small', // 统一控件大小，没用到
      quickFindKey: [], // 快捷查询需要的key
      findValue: {}, // 绑定控件的值，创立全部的字段，用于绑定控件
      returnValue: {}, // 返回给上层的实体类，只返回有查询条件的字段
      arrMeta: [], // 二维数组存放meta，遍历全部查询
      quickFindMeta: [] // 二维数组存放meta，遍历快捷查询
    }
  )

  // 查询的相关函数
  const findDataFun = {
    // 把表单子控件转换为多行多列的形式
    getFindTable: function () {
      var tdCount = 0
      var tr = []
      findDataInfo.arrMeta = []
      findDataInfo.findValue = {}
      findDataInfo.returnValue = {}
      for (var index in props.meta.findMeta.allFind) { // 遍历子控件的meta的key的数组，便于排序
        var key = props.meta.findMeta.allFind[index] // 数组里面的meta的key
        var meta = props.meta.findItem[key] // 子控件的meta
        findDataInfo.findValue[meta.colName] = '' // 创建实体类
        tr.push(meta) // 往一行里面放
        tdCount += 1 + meta.tdCount // 计算一行是否放满
        if (tdCount >= props.meta.findMeta.colCount * 2) { // 一行放满了，存入table
          findDataInfo.arrMeta.push(tr)
          tr = []
          tdCount = 0
        }
      }
      if (tr.length > 0) { // 把不满行的tr放入table
        findDataInfo.arrMeta.push(tr)
      }
      // 把快捷key放进去
      // this.clickQuickFind()
    },
    // 快捷查询
    getvalue: function (value, colName, id) {
      // 判断是不是级联控件
      if (props.meta.findItem[id].controlType === 200) {
        const arr = props.meta.findItem[id].colName.split(',')
        for (let i = 0; i < arr.length; i += 1) {
          if (i < value[1].length) {
            findDataInfo.findValue[arr[i]] = [value[0], value[1][i]]
            findDataInfo.returnValue[arr[i]] = [value[0], value[1][i]]
          }
        }
      } else {
        findDataInfo.findValue[colName] = value
        findDataInfo.returnValue[colName] = value
      }
      ctx.$emit('update:modelValue', findDataInfo.returnValue) // 返回给调用者
      ctx.$emit('getvalue', findDataInfo.returnValue, colName, id) // 返回给中间组件
    },
    // 更多查询，使用的查询字段放入快捷
    getvalue2: function (id) {
      // 查找是否已经有了
      var have = false
      for (var i = 0; i < findDataInfo.quickFindMeta.length; i += 1) {
        if (findDataInfo.quickFindMeta[i].controlId === id) {
          have = true
        }
      }
      if (!have) {
        findDataInfo.quickFindMeta.push(props.meta.findItem[id])
      }
      // this.getvalue()
    }
  }

  // 监控控件值的变化
  watch(() => findDataInfo.value, (value, prevValue) => {
    // alert('value的变化' + value + '_' + prevValue)
    findDataFun.sendQuery() // 向上层提交
  })

  return {
    dicFindKind,
    dicFindWhere,
    findDataInfo,
    findDataFun
  }
}
