<template>
  <el-dialog title="エピックの追加" :visible="visibility"
    @open="openModal" @close="closeModal"
    width="90%" append-to-body class="addEpicModal">
    <el-form :model="forms" :rules="rules" ref="forms">
      <el-form-item label="概要" prop="summary">
        <el-input v-model="forms.summary" auto-complete="off"
          placeholder="エピックのゴールを簡潔に" ref="summaryForm"/>
      </el-form-item>
      <el-form-item label="詳細">
        <el-input type="textarea" v-model="forms.details" placeholder="詳細（メモ）"/>
      </el-form-item>
      <el-form-item class="buttons">
        <el-row type="flex" justify="end">
          <el-button type="info" @click="addEpicThenClose">
            追加して閉じる
          </el-button>
          <el-button type="primary" @click="addEpicAndContinue">
            続けて追加する
          </el-button>
        </el-row>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import backlog from '@/utils/backlog';

export default {
  name: 'AddEpicDialog',
  data() {
    return {
      forms: {
        details: '',
        summary: '',
      },
      result: {},
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
  methods: {
    addEpic() {
      this.$refs.forms.validate((valid) => {
        if (valid) {
          this.postBacklogNewEpic(
            this.properties.projectId,
            this.properties.issueTypeId,
            this.forms.summary,
            (this.forms.details === '') ? '' : this.forms.details,
            'response')
            .then((data) => {
              this.$set(this.result, 'body', data);
            })
            .then(() => {
              this.$message.success({
                showClose: true,
                message: `エピック「${this.forms.summary}」を追加しました。`,
              });
              this.epics.push(this.response);
            })
            .then(() => Promise.resolve())
            .catch(() => {
              // FIXME: GUI should reflects sync failure
              this.$message.error({
                showClose: true,
                message: `エピック「${this.forms.summary}」の追加に失敗しました。`,
              });
              return Promise.reject();
            })
            .finally(() => {
              this.response = {};
            });
          return Promise.resolve();
        }
        this.$message.error({
          showClose: true,
          message: `エピック「${this.forms.summary}」の追加に失敗しました。`,
        });
        return Promise.reject();
      });
    },
    addEpicAndContinue(event) {
      event.preventDefault();
      this.addEpic();
      this.clearForms();
      this.focusSummaryForm();
    },
    addEpicThenClose() {
      this.addEpic();
      this.closeModal();
    },
    clearForms() {
      Object.keys(this.forms).forEach((prop) => {
        this.forms[prop] = '';
      });
    },
    closeModal() {
      this.$emit('add-epic-modal-closed', this.result);
    },
    focusSummaryForm() {
      // form is not generated at the 1st time
      if (this.$refs.summaryForm !== undefined) {
        this.$refs.summaryForm.$el.querySelector('input').focus();
      }
    },
    openModal() {
      this.clearForms();
      window.setTimeout(this.focusSummaryForm, 100);
    },
  },
};
</script>
