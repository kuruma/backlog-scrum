<template>
  <el-dialog title="コメントの追加" :visible="visibility"
      @open="openModal" @close="closeModal"
      width="90%" append-to-body class="addCommentModal">
    <p>ほげほげったー</p>
  </el-dialog>
</template>

<script>
export default {
  name: 'AddCommentDialog',
  data() {
    return {
      uncommitedInfo: {
        comment: '',
      },
    };
  },
  props: [
    'storyId',
    'visibility',
  ],
  methods: {
    closeModal() {
      this.uncommitedInfo.comment = 'fugafuga';
      this.$emit('add-comment-modal-closed', this.uncommitedInfo);
    },
    openModal() {
      Object.keys(this.uncommitedInfo).forEach((prop) => {
        this.uncommitedInfo[prop] = '';
      });
    }
  },
};
</script>

<style>
</style>
