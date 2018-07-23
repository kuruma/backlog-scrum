<template>
  <el-main v-loading="loading">
    <el-row class="controllers">
      <el-col justify="start" :span="16">
        <el-tooltip content="エピックを追加" effect="dark" placement="top">
          <el-button @click="showAddEpicModal">
            <icon name="plus" label="エピックを追加"/>
          </el-button>
        </el-tooltip>
        <el-tooltip content="保存済みの優先順位で並べる" effect="dark" placement="top">
          <el-button @click="sortEpicsByPriority">
            <icon name="sort-numeric-down" label="保存済みの優先順位で並べる"/>
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
      }" element="el-collapse" :component-data="getEpicsComponentData()" id="epics" ref="epics">
      <el-collapse-item v-for="(epic, key) in epics" :key="epic.id" :name="epic.id"
        :ref="`epic_${epic.id}`" class="epic-item"
        :data-epickey="`${key}`" :data-epicid="`${epic.id}`"
        :data-epicpriority="getPriorityOfEpic(epic)">
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
                <el-button @click="moveEpicToTop" class="move-to-top-button"
                  round size="small">
                  <icon name="level-up-alt" label="最上位に移動"/>
                </el-button>
              </el-tooltip>
            </el-col>
          </el-row>
        </template>
        <div class="epic-details">
          <div class="epic-info">
            <p>{{ epic.description }}</p>
            <small>
              <icon name="user" title="チケット作成者"/>
              {{ epic.createdUser.name }}:
              <icon name="ticket-alt" title="バグチケット"/>
              <a :href="generateBacklogUriFromKeyId(epic.issueKey)">
                {{ epic.issueKey }}
              </a>
            </small>
          </div>
          <ul class="user-stories">
            <li v-for="story in userStories[key]" :key="story.id" :ref="`stories_${key}`"
              :class="{ 'completed-story': story.status.name === '完了' }">
              <el-row>
                {{ story.summary }}
              </el-row>
              <el-row type="flex" justify="end">
                <!-- TODO: Set story point here -->
                <el-radio-group v-model="storyPoints[story.id]"
                  @change="setStoryPointOfUserStory(story.id)" size="mini">
                  <el-radio-button label="1">1</el-radio-button>
                  <el-radio-button label="2">2</el-radio-button>
                  <el-radio-button label="3">3</el-radio-button>
                  <el-radio-button label="5">5</el-radio-button>
                  <el-radio-button label="8">8</el-radio-button>
                  <el-radio-button label="13">13</el-radio-button>
                  <el-radio-button label="21">21 </el-radio-button>
                  <el-radio-button label="99">∞</el-radio-button>
                  <el-radio-button label="100" selected>?</el-radio-button>
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
        <el-form-item prop="teamCategories">
          <el-checkbox-group v-model="pendingUserStory.teamCategories">
            <el-checkbox v-for="c in teamCategories" :key="`${c.projectId}_${c.id}`"
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
import 'vue-awesome/icons/angle-double-down';
import 'vue-awesome/icons/angle-double-up';
import 'vue-awesome/icons/bars';
import 'vue-awesome/icons/calendar-alt';
import 'vue-awesome/icons/level-up-alt';
import 'vue-awesome/icons/plus';
import 'vue-awesome/icons/sort-numeric-down';
import 'vue-awesome/icons/ticket-alt';
import 'vue-awesome/icons/user';

export default {
  name: 'Epics',
  mixins: [
    backlog,
    date,
  ],
  data() {
    return {
      epicRules: {
        summary: [
          { required: true, message: '必須項目です', trigger: 'blur' },
        ],
      },
      loading: true,
      userStoryRules: {
        summary: [
          { required: true, message: '必須項目です', trigger: 'blur' },
        ],
        teamCategories: [
          { min: 1, message: '少なくとも1つ以上のカテゴリに属する必要があります', trigger: 'blur,change' },
        ],
      },
      loadedUserStory: {},
      storyPoints: {},
      parentEpic: {},
      parentEpicKey: -1,
      pendingUserStory: {
        sumary: '',
        who: '',
        why: '',
        goal: '',
        teamCategories: [],
        details: '',
      },
      pendingEpic: {
        summary: '',
        details: '',
      },
      isShownAddEpicModal: false,
      isShownAddUserStoryModal: false,
      teamCategories: [], // Loaded categories info filtered by teams' one
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
    addEpic() {
      this.$refs.pendingEpic.validate()
        .then(() =>
          this.postBacklogNewEpic(
            this.projects.id,
            this.$store.getters.backlogEpicId,
            this.pendingEpic.summary,
            (this.pendingEpic.details === '') ? '' : this.pendingEpic.details,
            'response',
          ))
        .then(() => {
          this.epics.push(this.response);
        })
        .then(() => {
          this.moveEpicToTopByIndex(`${this.epics.length - 1}`);
        })
        .catch(() => {
          // TODO: Error handling
        })
        .finally(() => {
          this.response = {};
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
      this.postBacklogNewUserStoryRelatedEpic(
        this.projects.id,
        this.$store.getters.backlogUserStoryId,
        this.parentEpic.id,
        this.pendingUserStory.summary,
        this.pendingUserStory.teamCategories,
        detailItems.join('\n\n'),
        'response')
        .then(() => {
        // TODO: insert response issuce to the last of user story list
          this.userStories[this.parentEpicKey].push(this.response);
        })
        .finally(() => {
          this.response = {};
        });
    },
    setStoryPointOfUserStory(storyId) {
      const spid = this.$store.getters.backlogStoryPointVarId;
      this.updateStoryPointOfIssue(storyId, spid, this.storyPoints[storyId])
        .then(() => {
          this.$message.success({
            showClose: true,
            message: `${storyId} のストーリーポイントを ${this.storyPoints[storyId]} に設定しました。`,
          });
        })
        .catch((rejected) => {
          // FIXME: GUI should reflects sync failure
          this.$message.error({
            showClose: true,
            message: `${storyId} の優先度保存に失敗しました:\n${rejected}`,
          });
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
      } else if (event.oldIndex !== event.newIndex) {
        // TODO: impl. to sync
      }
    },
    getEpicsComponentData() {
      return {
        on: {
          change: this.loadUserStoriesRelatedEpic,
        },
      };
    },
    getPriorityOfEpic(epic) {
      const priId = this.$store.getters.backlogPriorityVarId;
      // FIXME: Dirty compare
      const xArr = epic.customFields.filter(field => `${field.id}` === `${priId}`);
      if (xArr.length === 1) {
        const priority = xArr[0].value - 0;
        return priority;
      }
      return 0;
    },
    loadUserStoriesRelatedEpic(value) {
      const l = value.length;
      for (let i = 0; i < l; i += 1) {
        const refName = `epic_${value[i]}`;
        const node = this.$refs[refName][0].$el;
        if (typeof node.dataset.loadedrelatedstories === 'undefined') {
          this.$refs[refName][0].$el.dataset.loadedrelatedstories = true;
          this.loadUserStories(value[i], node.dataset.epickey);
        }
      }
    },
    loadUserStories(epicid, epicNodeKey) {
      const param = {
        'projectId[]': this.projects.id,
        'parentIssueId[]': epicid,
        'issueTypeId[]': this.$store.getters.backlogUserStoryId,
        parentChild: 2, // Only child task
        count: 100,
        sort: 'updated',
      };
      if (this.userStories[epicNodeKey] === undefined) {
        this.$set(this.userStories, epicNodeKey, []);
      }
      this.requestor('issues', param, 'loadedUserStory')
        .then(() => {
          this.$set(this.userStories, epicNodeKey, this.loadedUserStory);
        })
        .catch(() => {
          const refName = `epic_${epicid}`;
          delete this.$refs[refName][0].$el.dataset.loadedrelatedstories;
        });
      this.loadedUserStory = {};
    },
    moveEpicToTop(event) {
      event.stopPropagation();
      const itemNode = event.target.closest('.epic-item');
      const itemsNode = itemNode.closest('#epics');
      const items = itemsNode.querySelectorAll('.epic-item');
      let idx;
      for (idx = 0; idx < items.length; idx += 1) {
        if (items[idx] === itemNode) {
          break;
        }
      }
      this.moveEpicToTopByIndex(idx);
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
      // FIXME: Dirty...
      window.setTimeout(this.focusUserStorySummaryForm, 100);
    },
    setParentEpic(epic) {
      this.parentEpic = epic;
    },
    sortEpicsByPriority() {
      const epics = this.$refs.epics;
      const epicItems = epics.$children[0].$children;
      const el = epicItems.length;
      const mst = new Array(el);
      for (let i = 0; i < el; i += 1) {
        mst[i] = {
          key: i,
          priority: epicItems[i].$el.dataset.epicpriority,
          ref: `epic_${epicItems[i].$el.dataset.epicid}`,
          tmp: epicItems[i].$el.dataset.epicid,
        };
      }
      mst.sort((a, b) => a.priority - b.priority);
      const epicsNode = epics.$el;
      for (let i = 0; i < el; i += 1) {
        const ref = mst[i].ref;
        epicsNode.append(this.$refs[ref][0].$el);
      }
    },
    syncEpicOrder(epicid, priorityVariableId, orderNumber) {
      this.updatePriorityOfIssue(epicid, priorityVariableId, orderNumber)
        .then(() => {
          this.$message.success({
            showClose: true,
            message: `${epicid} の優先度を ${orderNumber} に設定しました。`,
          });
        })
        .catch((rejected) => {
          this.$message.error({
            showClose: true,
            message: `${epicid} の優先度保存に失敗しました:\n${rejected}`,
          });
        });
    },
    syncEpicsOrder() {
      const l = this.$refs.epics.$el.children.length;
      const priId = this.$store.getters.backlogPriorityVarId;
      let order = 1001;
      for (let i = 0; i < l; i += 1) {
        const epicNode = this.$refs.epics.$el.children[i];
        const epic = this.epics[epicNode.dataset.epickey];
        order += 10;
        this.syncEpicOrder(epic.id, priId, order);
      }
    },
    applyDatastore() {
      this.loading = true;
      this.loadBacklogProject()
        .then(() =>
          this.loadBacklogStatuses())
        .then(() =>
          this.loadBacklogEpics(this.projects.id,
            this.$store.getters.backlogEpicId, this.activeStatusIds))
        .then(() =>
          this.loadBacklogCategories(this.projects.id))
        .then(() => {
          this.teamCategories = this.categories.filter(
            value =>
              this.$store.getters.backlogCategoryIds.findIndex(
                v =>
                  value.id === v,
              ) >= 0);
        })
        .catch(() => {
          // FIXME: Error handling
        })
        .finally(() => {
          this.loading = false;
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
