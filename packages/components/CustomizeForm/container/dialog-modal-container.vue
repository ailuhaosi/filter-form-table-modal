<template>
  <el-dialog
    :modal-append-to-body="false"
    :visible="dialogFormVisible"
    :close-on-click-modal="false"
    :center="dialogCenter"
    class="customize-dialog-contain"
    @close="clearDialogVisible"
  >
  <template v-slot:title>
    <slot name="dialogTitle" />
  </template>
    <slot></slot>
    <template v-slot:footer>
      <slot name="footerBlockComponents" />
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "DialogModalContainer",
  props: {
    dialogTitle: {
      type: String,
      default: ""
    },
    dialogFormVisible: {
      type: Boolean,
      require: true,
      default: false
    },
    dialogCenter:{
      type: Boolean,
      default: false
    }
  },
  data () {
    return {

    }
  },
  methods: {
    clearDialogVisible () {
      this.$emit("clear-dialog-visible");
    }
  }
}
</script>

<style scoped>
</style>