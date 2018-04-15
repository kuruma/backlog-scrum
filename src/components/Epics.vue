<template>
  <el-main v-loading="loading">
    <el-row class="controllers">
      <el-col justify="start" :span="16">
        <el-tooltip content="エピックを追加" effect="dark" placement="top">
          <el-button @click="showAddEpicModal">
            <icon name="plus" label="エピックを追加"/>
          </el-button>
        </el-tooltip>
        <el-tooltip content="エピックの詳細を隠す" v-if="isShownEpicInfo" effect="dark" placement="top">
          <el-button @click="hideEpicInfo">
            <icon name="file-alt" title="エピックの詳細を隠す"/>
          </el-button>
        </el-tooltip>
        <el-tooltip content="エピックの詳細を表示" v-if="!isShownEpicInfo" effect="dark" placement="top">
          <el-button @click="showEpicInfo">
            <icon name="file" title="エピックの詳細を表示" v-if="!isShownEpicInfo"/>
          </el-button>
        </el-tooltip>
        <el-tooltip content="ユーザストーリを読込" v-if="!isShownUserStories" effect="dark" placement="top">
          <el-button @click="loadUserStories">
            <icon name="angle-double-down" title="ユーザストーリを読込"/>
          </el-button>
        </el-tooltip>
        <el-tooltip content="ユーザストーリを隠す" v-if="isShownUserStories" effect="dark" placement="top">
          <el-button @click="hideUserStories">
            <icon name="angle-double-up" title="ユーザストーリを隠す"/>
          </el-button>
        </el-tooltip>
      </el-col>
      <el-col justify="end" :span="8" align="right">
        <el-tooltip content="エピックの優先順位を保存" effect="dark" placement="top">
          <el-button @click="syncEpicsOrder">
            <icon name="save" label="エピックの優先順位を保存"/>
          </el-button>
        </el-tooltip>
      </el-col>
    </el-row>
    <draggable @end="endMovingEpic" :options="{
        animation: 250,
        delay: 50,
        handle: '.handle',
      }" element="el-collapse" id="epics" ref="epics">
      <el-collapse-item v-for="(epic, key) in epics" :key="epic.id" :name="epic.id"
        :ref="`epic_${key}`" :data-epickey="`${key}`" class="epic-item">
        <template slot="title">
          <el-row type="flex">
            <el-col :span="18">
              <span class="handle"><icon name="bars"/></span>
              {{ epic.summary }}
            </el-col>
            <el-col justify="end" :span="3" align="right">
              <small v-if="epic.dueDate">
                <icon name="calendar-alt" label="期限"/>
                {{ dateToString(epic.dueDate) }}
              </small>
            </el-col>
            <el-col justify="end" :span="3" align="center">
              <el-tooltip content="最上位に移動" effect="dark" placement="top">
                <el-button @click="moveEpicToTop" class="move-to-top-button" :data-epicref="key"
                  round size="small">
                  <icon name="level-up-alt" label="最上位に移動"/>
                </el-button>
              </el-tooltip>
            </el-col>
          </el-row>
        </template>
        <div class="epic-details" v-if="isShownUserStories">
          <ul class="user-stories">
            <li v-for="story in userStories[key]" :key="story.id" :ref="`stories_${key}`"
              :class="{ 'completed-story': story.status.name === '完了' }">
              <el-row>
                {{ story.summary }}
              </el-row>
              <el-row type="flex" justify="end">
                <!-- TODO: Set story point here -->
                <el-radio-group size="mini">
                  <el-radio-button disabled label="1"/>
                  <el-radio-button disabled label="2"/>
                  <el-radio-button disabled label="3"/>
                  <el-radio-button disabled label="5"/>
                  <el-radio-button disabled label="8"/>
                  <el-radio-button disabled label="13"/>
                  <el-radio-button disabled label="21"/>
                  <el-radio-button disabled label="∞"/>
                  <el-radio-button label="?" selected/>
                </el-radio-group>
              </el-row>
            </li>
            <li>
              <el-button @click="showAddUserStoryModal" :data-epickey="`${key}`"
                size="small" type="text">
                <icon name="plus"/>
                新しいユーザストーリを追加
              </el-button>
            </li>
          </ul>
        </div>
        <div class="epic-info" v-if="isShownEpicInfo">
          <p>{{ epic.description }}</p>
          <small>{{ epic.createdUser.name }}</small>
        </div>
      </el-collapse-item>
    </draggable>
    <el-dialog title="エピックの追加" :visible.sync="isShownAddEpicModal"
      @close="clearPendingEpic" width="90%" append-to-body class="addEpicModal">
      <el-form :model="pendingEpic" :rules="epicRules" ref="pendingEpic">
        <el-form-item label="概要" prop="summary">
          <el-input v-model="pendingEpic.summary" auto-complete="off"
            placeholder="エピックのゴールを簡潔に" ref="epicSummaryForm"/>
        </el-form-item>
        <el-form-item label="詳細">
          <el-input type="textarea" v-model="pendingEpic.details" placeholder="詳細（メモ）"/>
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
    <el-dialog title="ユーザストーリの追加" :visible.sync="isShownAddUserStoryModal"
      @close="clearPendingUserStory" width="90%" append-to-body class="addUserStoryModal">
      <el-form :model="pendingUserStory" :rules="userStoryRules" ref="pendingUserStory">
        <el-form-item prop="summary">
          <el-input v-model="pendingUserStory.summary" auto-complete="off"
            placeholder="概要" ref="userStorySummaryForm"/>
        </el-form-item>
        <el-form-item>
          <p><mark>{{ parentEpic.summary }}</mark>に向けて、</p>
        </el-form-item>
        <el-form-item prop="who">
          <el-input v-model="pendingUserStory.who" size="small"
            placeholder="嬉しいのは誰？変わる影響を受けるのは誰？">
            <template slot="append">が、</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="why">
          <el-input v-model="pendingUserStory.why" size="small"
            placeholder="どんな価値？どう変える/変わる？何が嬉しい？">
            <template slot="append">のために、</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="goal">
          <el-input v-model="pendingUserStory.goal" size="small"
            placeholder="ゴールは？終わった時に何を見せる/出来ている？">
            <template slot="append">をする。</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="categories">
          <el-checkbox-group v-model="pendingUserStory.categories">
            <el-checkbox v-for="c in categories" :key="`${c.projectId}_${c.id}`"
              :label="c.id" border>
              {{ c.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="詳細">
          <el-input type="textarea" v-model="pendingUserStory.details"
            placeholder="詳細（メモ）" size="small"/>
        </el-form-item>
        <el-form-item class="buttons">
          <el-row type="flex" justify="end">
            <el-button type="info" @click="addUserStoryThenClose">
              追加して閉じる
            </el-button>
            <el-button type="primary" @click="addUserStoryAndContinue">
              続けて追加する
            </el-button>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>
  </el-main>
</template>

<script>
import draggable from 'vuedraggable';
import Icon from 'vue-awesome/components/Icon';
import backlog from '@/utils/backlog';
import date from '@/utils/date';

import 'vue-awesome/icons/save';
import 'vue-awesome/icons/file';
import 'vue-awesome/icons/file-alt';
import 'vue-awesome/icons/angle-double-down';
import 'vue-awesome/icons/angle-double-up';
import 'vue-awesome/icons/bars';
import 'vue-awesome/icons/calendar-alt';
import 'vue-awesome/icons/level-up-alt';
import 'vue-awesome/icons/plus';

export default {
  name: 'Epics',
  mixins: [
    backlog,
    date,
  ],
  data() {
    return {
      collapsedEpics: [],
      firstView: true,
      epicRules: {
        summary: [
          { required: true, message: '必須項目です', trigger: 'blur' },
        ],
      },
      loading: true,
      epics: [],
      projects: {},
      space: {},
      userStories: {},
      userStoryRules: {
        summary: [
          { required: true, message: '必須項目です', trigger: 'blur' },
        ],
        categories: [
          { min: 1, message: '少なくとも1つ以上のカテゴリに属する必要があります', trigger: 'blur,change' },
        ],
      },
      loadedUserStory: {},
      parentEpic: {},
      parentEpicKey: -1,
      categories: {},
      pendingUserStory: {
        sumary: '',
        who: '',
        why: '',
        goal: '',
        categories: [],
        details: '',
      },
      pendingEpic: {
        summary: '',
        details: '',
      },
      response: {},
      isShownUserStories: false,
      isShownEpicInfo: false,
      isShownAddEpicModal: false,
      isShownAddUserStoryModal: false,
    };
  },
  components: {
    draggable,
    Icon,
  },
  methods: {
    focusEpicSummaryForm() {
      // form is not generated at the 1st time
      if (this.$refs.epicSummaryForm !== undefined) {
        this.$refs.epicSummaryForm.$el.querySelector('input').focus();
      }
    },
    focusUserStorySummaryForm() {
      // form is not generated at the 1st time
      if (this.$refs.userStorySummaryForm !== undefined) {
        this.$refs.userStorySummaryForm.$el.querySelector('input').focus();
      }
    },
    hideEpicInfo() {
      this.isShownEpicInfo = false;
    },
    showEpicInfo() {
      this.isShownEpicInfo = true;
      this.focusEpicSummaryForm();
    },
    addEpic() {
      const param = {
        projectId: this.projects.id,
        issueTypeId: this.$store.getters.backlogEpicId,
        priorityId: 3, // FIXME: Should be customizable
        summary: this.pendingEpic.summary,
        description: this.pendingEpic.details === '' ? '' : this.pendingEpic.details,
      };
      this.$refs.pendingEpic.validate()
        .then(() => {
          this.postRequestor('issues', param, 'response')
            .then(() => {
              this.epics.push(this.response);
            })
            .then(() => {
              this.moveEpicToTopByIndex(`${this.epics.length - 1}`);
            })
            .then(() => {
              this.response = {};
            });
        })
        .catch(() => {
        });
    },
    addUserStory() {
      const detailItems = [];
      if (this.pendingUserStory.who.length > 0) {
        detailItems.push(`# 誰のために\n\n${this.pendingUserStory.who}`);
      }
      if (this.pendingUserStory.why.length > 0) {
        detailItems.push(`# 何のために\n\n${this.pendingUserStory.why}`);
      }
      if (this.pendingUserStory.goal.length > 0) {
        detailItems.push(`# ゴール\n\n${this.pendingUserStory.goal}`);
      }
      if (this.pendingUserStory.details.length > 0) {
        detailItems.push(`# 詳細\n\n${this.pendingUserStory.details}`);
      }
      // TODO: set epic id as parent issue
      // const epicid = this.parentEpic.id;
      const param = {
        projectId: this.projects.id,
        issueTypeId: this.$store.getters.backlogUserStoryId,
        priorityId: 3, // FIXME: Should be customizable
        // parentIssueId: epicid,
        summary: this.pendingUserStory.summary,
        categoryId: this.pendingUserStory.categories,
        description: detailItems.join('\n\n'),
      };
      this.postRequestor('issues', param, 'response')
        .then(() => {
          // TODO: insert response issuce to the last of user story list
          this.userStories[this.parentEpicKey].push(this.response);
        })
        .then(() => {
          this.response = {};
        });
    },
    addEpicAndContinue(event) {
      event.preventDefault();
      this.addEpic();
      this.clearPendingEpic();
      this.focusEpicSummaryForm();
    },
    addEpicThenClose() {
      this.addEpic();
      this.isShownAddEpicModal = false;
    },
    addUserStoryAndContinue(event) {
      event.preventDefault();
      this.addUserStory();
      this.clearPendingUserStory();
      this.focusUserStorySummaryForm();
    },
    addUserStoryThenClose() {
      this.addUserStory();
      this.isShownAddUserStoryModal = false;
    },
    clearPendingEpic() {
      Object.keys(this.pendingEpic).forEach((prop) => {
        this.pendingEpic[prop] = '';
      });
    },
    clearPendingUserStory() {
      Object.keys(this.pendingUserStory).forEach((prop) => {
        this.pendingUserStory[prop] = '';
      });
    },
    endMovingEpic(event) {
      if (event.from !== event.to) {
        // TODO: impl. to sync
        console.log(`${event.from.id} was updated`);
        console.log(`${event.to.id} was updated`);
      } else if (event.oldIndex !== event.newIndex) {
        // TODO: impl. to sync
        console.log(`${event.from.id} was updated`);
      }
    },
    hideUserStories() {
      this.isShownUserStories = false;
      this.parentEpicKey = -1;
    },
    loadUserStories() {
      this.isShownUserStories = true;
      // FIXME: Flexible limitation
      const l = (this.$refs.epics.$el.children.length < 20)
        ? this.$refs.epics.$el.children.length
        : 20;
      for (let i = 0; i < l; i += 1) {
        const key = this.$refs.epics.$el.children[i].dataset.epickey;
        // TODO: Support Parent/Child issues
        // const id = this.epics[key].id;
        const param = {
          'projectId[]': this.projects.id,
          // 'parentIssueId[]': id,
          'issueTypeId[]': this.$store.getters.backlogUserStoryId,
          // parentChild: 2, // Only child task
          count: 100,
          sort: 'updated',
        };
        if (this.userStories[key] === undefined) {
          this.$set(this.userStories, key, []);
        }
        this.requestor('issues', param, 'loadedUserStory')
          .then(() => {
            this.userStories[key] = this.loadedUserStory;
          });
      }
      this.loadedUserStory = {};
    },
    moveEpicToTop(event) {
      event.stopPropagation();
      const btnNode = event.target.closest('button');
      const epicref = btnNode.dataset.epicref;
      this.moveEpicToTopByIndex(epicref);
    },
    moveEpicToTopByIndex(idx) {
      this.$refs.epics.$el.insertBefore(
        this.$refs.epics.$el.children[idx],
        this.$refs.epics.$el.children[0]);
    },
    showAddEpicModal() {
      this.isShownAddEpicModal = true;
      // FIXME: Dirty...
      window.setTimeout(this.focusEpicSummaryForm, 100);
    },
    showAddUserStoryModal() {
      const btnNode = event.target.closest('button');
      this.parentEpicKey = btnNode.dataset.epickey;
      this.parentEpic = this.epics[this.parentEpicKey];
      this.isShownAddUserStoryModal = true;
      window.setTimeout(this.focusUserStorySummaryForm, 100);
    },
    setParentEpic(epic) {
      this.parentEpic = epic;
    },
    syncEpicsOrder() {
      const l = this.$refs.epics.$el.children.length;
      for (let i = 0; i < l;) {
        const epicNode = this.$refs.epics.$el.children[i];
        const epic = this.epics[epicNode.dataset.epickey];
        i += 1;
        // TODO: impl. save priority of epics
        console.log(`${epic.summary}の優先度を${i}で上書きします`);
      }
    },
    applyDatastore() {
      this.loading = true;
      this.requestor('space')
        .then(() =>
          this.requestor(`projects/${this.projectKey}`))
        .then(() => {
          const param = {
            'projectId[]': this.projects.id,
            parentChild: 1, // Except child task
            count: 100,
            sort: 'updated',
          };
          const eid = this.$store.getters.backlogEpicId;
          if (eid > 0) {
            param['issueTypeId[]'] = `${eid}`;
          }
          this.requestor(
            'issues',
            param,
            'epics',
          );
        })
        .then(() =>
          this.requestor(`projects/${this.projectKey}/categories`, undefined, 'categories'))
        .then(() => {
          this.categories = this.categories.filter(
            value =>
              this.$store.getters.backlogCategoryIds.findIndex(
                v =>
                  value.id === v,
              ) >= 0);
          this.categories.forEach((element, index) => {
            this.$set(this.categories[index], 'state', false);
          });
        })
        .then(() => {
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          // TODO
        });
    },
  },
  created() {
    this.$on('datastore-updated', this.applyDatastore);
    // datastore-updated only called this page is loaded at 1st time
    if (this.projectKey) {
      this.applyDatastore();
    }
  },
};
</script>

<style scoped>
main {
  height: 100%;
}
#epics .move-to-top-button {
  margin: auto 0.5rem;
}
#epics .epic-item:first-child .move-to-top-button {
  display: none;
}
.controllers {
  margin-bottom: 20px;
}
.user-stories li {
  display: block;
  border-style: solid none none;
  border-color: #dcdfe6; /* Same as nase border */
  border-width: 1px 0;
  min-height: 2rem;
  margin: 0;
  width: 100%;
}
.user-stories li:last-child {
  border-bottom-style: solid;
}
.user-stories .completed-story {
  background-color: #909399; /* Same as Info color */
  color: #c0c4cc; /* Same as placeholder text */
}
.addUserStoryModal .el-form-item {
  margin-bottom: 0;
}
.addUserStoryModal .el-form-item.buttons {
  margin-top: 22px;
}
.addUserStoryModal p {
  margin-bottom: 0;
}
.handle {
  cursor: grab;
  padding: 1rem;
}
.dragging .handle {
  /* FIXME: Does not applied */
  cursor: grabbing;
}
</style>
