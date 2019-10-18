<template>
  <div
    ref="input"
    contenteditable="true"
    v-html="innerText"
    @input="changeText"
    @focus="isChange = false"
    @blur="blurFunc"
  ></div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'
export default {
  props: {
    value: ''
  },
  data() {
    return {
      innerText: this.value,
      isChange: true
    }
  },
  watch: {
    value() {
      if (this.isChange) {
        this.innerText = this.value
      }
    }
  },
  methods: {
    blurFunc() {
      this.isChange = true
    //   this.$emit('blurFunc')
    },
    // 修改内容
    changeText() {
      this.$emit('input', this.$refs.input.innerHTML)
    },
    // 清空内容
    clearText() {
      this.$refs.input.innerHTML = ''
      this.changeText()
    },
    // 指定dom获得焦点时，光标处插入html
    insertAtCursor(html) {
      var dom = this.$refs.input
      dom.focus()
      // 当前获得焦点的元素非指定dom, 直接把html追加在最后
      // console.log(window.getSelection().getRangeAt(0))
        console.log(document.activeElement)
      if (dom !== document.activeElement) {
        //     // console.log(dom.innerHTML)
        dom.innerHTML = dom.innerHTML + html
        //     // console.log(dom.innerHTML)
        return
      }
      var sel, range
      // IE9 或 非IE浏览器
      if (window.getSelection) {
        // 返回一个 Selection 对象，表示用户选择的文本范围或插入符号的当前位置。
        sel = window.getSelection()
        // getRangeAt——返回一个包含当前选区内容的区域对象。
        // rangeCount——返回选区中range对象数量的只读属性,通常情况下rangeCount属性的值总为0(未点击页面)或1(点击了页面)
        if (sel.getRangeAt && sel.rangeCount) {
          // 返回一个包含当前选区内容的区域对象。
          range = sel.getRangeAt(0)
          // 移除来自 Document的Range 内容。
          range.deleteContents()
          var el = document.createElement('div')
          el.innerHTML = html
          var frag = document.createDocumentFragment(),
            node,
            lastNode
          // 从头到尾把el的元素放入frag内(appendChild会把el.firstChild取走)
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node)
          }
          // 选区中插入内容
          range.insertNode(frag)
          if (lastNode) {
            // 克隆一份range,相互独立
            range = range.cloneRange()
            // 在指定的节点后开始范围(这里指定在最后节点开始算选区范围)
            range.setStartAfter(lastNode)
            // 折叠该范围，使它的边界点重合
            range.collapse(true)
            // 移除选区
            sel.removeAllRanges()
            // 加入选区
            sel.addRange(range)
          }
        }
      } else if (document.selection && document.selection.type != 'Control') {
        // IE < 9
        document.selection.createRange().pasteHTML(html)
      }
    //   表情加入不是响应式的，需要手动触发把最新值传出去
      this.changeText()
    },
    // div(contenteditable=true)光标移到最后(因为focus默认光标在最前面)
    keepLastIndex() {
      var obj = this.$refs.input
      obj.focus() // 解决ff不获取焦点无法定位问题
      if (window.getSelection && obj.innerHTML) {
        // ie11 10 9 ff safari
        let range = window.getSelection() // 创建range
        range.selectAllChildren(obj) // range 选择obj下所有子内容
        range.collapseToEnd() // 光标移至最后
      } else if (document.selection) {
        // ie10 9 8 7 6 5
        let range = document.selection.createRange() // 创建选择对象
        // var range = document.body.createTextRange();
        range.moveToElementText(obj) // range定位到obj
        range.collapse(false) // 光标移至最后
        range.select()
      }
    }
  }
}
</script>
<style lang='scss' scoped>
</style>
