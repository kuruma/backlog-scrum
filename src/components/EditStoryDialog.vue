<template>
  <el-dialog title="ストーリーの編集" :visible="visibility"
    @open="openModal" @close="closeModal"
    width="90%" append-to-body class="editStoryModal">
    <el-form :model="forms" :rules="rules" ref="forms">
      <el-form-item label="概要" prop="summary">
        <el-input v-model="forms.summary" auto-complete="off"
          placeholder="ゴールを簡潔に" ref="summaryForm"/>
      </el-form-item>
      <el-row>
        <el-col :span="8">
          <el-form-item label="詳細">
            <el-input type="textarea" v-model="forms.details"
              placeholder="詳細（メモ）" ref="detailsForm"/>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <vue-markdown :source="forms.details"/>
        </el-col>
      </el-row>
      <el-form-item class="buttons">
        <el-row type="flex" justify="end">
          <el-button type="info" @click="resetModal">
            編集をリセット
          </el-button>
          <el-button type="info" @click="closeModal">
            キャンセル
          </el-button>
          <el-button type="primary" @click="saveThenCloseModal">
            保存
          </el-button>
        </el-row>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import VueMarkdown from 'vue-markdown';
import backlog from '@/utils/backlog';

export default {
  name: 'EditStoryDialog',
  data() {
    return {
      forms: {
        details: '',
        summary: '',
      },
      // result: {},
      rules: {
        summary: [
          { required: true, message: '必須項目です', trigger: 'blur' },
        ],
      },
    };
  },
  props: [
    'properties',
    'visibility',
  ],
  mixins: [
    backlog,
  ],
  components: {
    'vue-markdown': VueMarkdown,
  },
  computed: {
    md_details() {
      return this.forms.details;
      // return markd(this.forms.details, { sanitize: true });
    },
  },
  methods: {
    clearForms() {
      Object.keys(this.forms).forEach((prop) => {
        this.forms[prop] = '';
      });
    },
    closeModal() {
      this.$emit('edit-story-modal-closed', this.result);
    },
    focusDetailsForm() {
      if (this.$refs.detailsForm !== undefined) {
        this.$refs.detailsForm.$el.querySelector('textarea').focus();
      }
    },
    loadStory() {
      // TODO: impl.
      this.$message.warning({
        showClose: true,
        message: 'ストーリー情報を読み込む機能は未実装です :-/',
      });
    },
    openModal() {
      this.clearForms();
      this.loadStory();
      window.setTimeout(this.focusDetailsForm, 100);
    },
    resetModal() {
      this.clearForms();
      this.loadStory();
    },
    saveThenCloseModal() {
      this.saveUpdatedStory();
      this.closeModal();
    },
    saveUpdatedStory() {
      // TODO: impl.
      // this.$set(this.result, 'body', data);
      // this.$set(this.result, 'updatedStoryId', this.storyId - 0);
      this.$message.warning({
        showClose: true,
        message: 'ストーリー情報を保存する機能は未実装です :-/',
      });
    },
  },
};
</script>
