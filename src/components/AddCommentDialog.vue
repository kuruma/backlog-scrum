<template>
  <el-dialog title="コメントの追加" :visible="visibility"
    @open="openModal" @close="closeModal"
    append-to-body class="addCommentModal">
    <el-form :model="uncommitedInfo" :rules="addCommentRules" ref="addCommentForm">
      <el-form-item label="コメント" prop="comment">
        <el-input type="textarea" v-model="uncommitedInfo.comment"
          placeholder="コメント本文" size="small"/>
      </el-form-item>
      <el-form-item class="buttons">
        <el-row type="flex" justify="end">
          <el-button type="primary" @click="addCommentThenClose">
            登録
          </el-button>
        </el-row>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import backlog from '@/utils/backlog';

export default {
  name: 'AddCommentDialog',
  data() {
    return {
      addCommentRules: {
        comment: [
          { required: true, message: '必須項目です', trigger: 'blur' },
        ],
      },
      uncommitedInfo: {
        comment: '',
      },
      result: {
        updatedStoryId: undefined,
        body: {},
      },
    };
  },
  props: [
    'storyId',
    'visibility',
  ],
  mixins: [
    backlog,
  ],
  methods: {
    addCommentThenClose() {
      this.$refs.addCommentForm.validate((valid) => {
        if (valid) {
          this.postBacklogComment(this.storyId, this.uncommitedInfo.comment)
            .then((data) => {
              this.$set(this.result, 'body', data);
              this.$set(this.result, 'updatedStoryId', this.storyId - 0);
              this.$message.success({
                showClose: true,
                message: 'コメントの登録が完了しました。',
              });
              this.closeModal();
            })
            .catch((rejected) => {
              this.$message.error({
                showClose: true,
                message: `Backlogへの送信時に課題予期せぬエラーが発生しました:\n${rejected}`,
              });
            });
        } else {
          this.$message.error({
            showClose: true,
            message: '入力不備を修正してください。',
          });
        }
      });
    },
    closeModal() {
      this.$emit('add-comment-modal-closed', this.result);
    },
    openModal() {
      Object.keys(this.uncommitedInfo).forEach((prop) => {
        this.uncommitedInfo[prop] = '';
      });
      this.$set(this.result, 'body', {});
      this.$set(this.result, 'updatedStoryId', undefined);
    },
  },
};
</script>

<style>
</style>
