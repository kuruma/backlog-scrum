<template>
  <el-main v-loading="loading">
    <el-row class="controllers">
      <el-col justify="start" :span="16">
        <el-tooltip content="すべてのストーリを表示" v-if="showOnlyAssigned" effect="dark" placement="top">
          <el-button @click="showAllStories">
            <icon name="user-circle" title="すべてのストーリを表示"/>
          </el-button>
        </el-tooltip>
        <el-tooltip content="担当しているストーリだけを表示" v-if="!showOnlyAssigned"
          effect="dark" placement="top">
          <el-button @click="showAssignedStories">
            <icon name="users" title="担当しているストーリだけを表示"/>
          </el-button>
       </el-tooltip>
      </el-col>
    </el-row>
    <el-row type="flex" class="kanban">
      <el-col :span="6" class="status status-todo" :data-statusid="kanbanStatusIds.todo">
        <h2>未着手</h2>
        <draggable @end="endMovingStories" :options="{
            group: 'stories',
            animation: 250,
            delay: 50,
            handle: '.el-card__header',
          }" element="div" id="todostories" ref="todostories" class="story-list todo-story-list">
          <el-card v-for="(story, key) in todoStories" :key="story.id" :name="story.id"
            :ref="`story_${key}`" :data-storyid="story.id"
            v-if="!showOnlyAssigned || (story.assignee !== null && story.assignee.id === myself.id)"
            class="story-item"
            :class="{
              urgent: isUrgentStory(story.category),
              assigned: story.assignee !== null && story.assignee.id === myself.id,
              }">
            <template slot="header" class="clearfix">
              <small class="epic-summary">{{ getEpicSummaryById(story.parentIssueId) }}</small>
              {{ story.summary }}
            </template>
            <div class="story-info">
              <ul>
                <li>
                  <small class="story-info-id">
                    <icon name="ticket-alt" title="バグチケット"/>
                    <a :href="generateBacklogUriFromKeyId(story.issueKey)">
                      {{ story.issueKey }}
                    </a>
                  </small>
                </li>
                <li>
                  <small class="story-info-reporter">
                    <icon name="user" title="作成者"/>
                    {{ getCreatedUserName(story) }}
                  </small>
                </li>
                <li>
                  <small v-if="story.dueDate">
                    <icon name="calendar-alt" label="期限"/>
                    {{ dateToString(story.dueDate) }}
                  </small>
                </li>
                <li>
                  <small v-if="story.assignee !== null"
                    class="story-info-assignee">
                    <icon name="user-circle" title="担当者"/>
                    {{ getAssigneeName(story) }}
                  </small>
                </li>
                <li>
                  <small v-for="category in story.category" :key="category.id" class="category">
                    <icon name="tag" title="カテゴリ"/>
                    {{ category.name }}
                  </small>
                </li>
              </ul>
            </div>
          </el-card>
        </draggable>
      </el-col>
      <el-col :span="6" class="status status-doing" :data-statusid="kanbanStatusIds.doing">
        <h2>処理中</h2>
        <draggable @end="endMovingStories" :options="{
            group: 'stories',
            animation: 250,
            delay: 50,
            handle: '.el-card__header',
          }" element="div" id="doingstories" ref="doingstories" class="story-list doing-story-list">
          <el-card v-for="(story, key) in doingStories" :key="story.id" :name="story.id"
            :ref="`story_${key}`" :data-storyid="story.id"
            v-if="!showOnlyAssigned || (story.assignee !== null && story.assignee.id === myself.id)"
            class="story-item"
            :class="{
              urgent: isUrgentStory(story.category),
              assigned: story.assignee !== null && story.assignee.id === myself.id,
              }">
            <template slot="header" class="clearfix">
              <small class="epic-summary">{{ getEpicSummaryById(story.parentIssueId) }}</small>
              {{ story.summary }}
            </template>
            <div class="story-info">
              <ul>
                <li>
                  <small class="story-info-id">
                    <icon name="ticket-alt" title="バグチケット"/>
                    <a :href="generateBacklogUriFromKeyId(story.issueKey)">
                      {{ story.issueKey }}
                    </a>
                  </small>
                </li>
                <li>
                  <small class="story-info-reporter">
                    <icon name="user" title="作成者"/>
                    {{ getCreatedUserName(story) }}
                  </small>
                </li>
                <li>
                  <small v-if="story.dueDate">
                    <icon name="calendar-alt" label="期限"/>
                    {{ dateToString(story.dueDate) }}
                  </small>
                </li>
                <li>
                  <small v-if="story.assignee !== null"
                    class="story-info-assignee">
                    <icon name="user-circle" title="担当者"/>
                    {{ getAssigneeName(story) }}
                  </small>
                </li>
                <li>
                  <small v-for="category in story.category" :key="category.id" class="category">
                    <icon name="tag" title="カテゴリ"/>
                    {{ category.name }}
                  </small>
                </li>
              </ul>
            </div>
          </el-card>
        </draggable>
      </el-col>
      <el-col :span="6" class="status status-blocked" :data-statusid="kanbanStatusIds.blocked">
        <h2>ブロック</h2>
        <draggable @end="endMovingStories" :options="{
            group: 'stories',
            animation: 250,
            delay: 50,
            handle: '.el-card__header',
          }" element="div" id="blockedstories" ref="blockedstories"
          class="story-list blocked-stoty-list">
          <el-card v-for="(story, key) in blockedStories" :key="story.id" :name="story.id"
            :ref="`story_${key}`" :data-storyid="story.id"
            v-if="!showOnlyAssigned || (story.assignee !== null && story.assignee.id === myself.id)"
            class="story-item"
            :class="{
              urgent: isUrgentStory(story.category),
              assigned: story.assignee !== null && story.assignee.id === myself.id,
              }">
            <template slot="header" class="clearfix">
              <small class="epic-summary">{{ getEpicSummaryById(story.parentIssueId) }}</small>
              {{ story.summary }}
            </template>
            <div class="story-info">
              <ul>
                <li>
                  <small class="story-info-id">
                    <icon name="ticket-alt" title="バグチケット"/>
                    <a :href="generateBacklogUriFromKeyId(story.issueKey)">
                      {{ story.issueKey }}
                    </a>
                  </small>
                </li>
                <li>
                  <small class="story-info-reporter">
                    <icon name="user" title="作成者"/>
                    {{ getCreatedUserName(story) }}
                  </small>
                </li>
                <li>
                  <small v-if="story.dueDate">
                    <icon name="calendar-alt" label="期限"/>
                    {{ dateToString(story.dueDate) }}
                  </small>
                </li>
                <li>
                  <small v-if="story.assignee !== null"
                    class="story-info-assignee">
                    <icon name="user-circle" title="担当者"/>
                    {{ getAssigneeName(story) }}
                  </small>
                </li>
                <li>
                  <small v-for="category in story.category" :key="category.id" class="category">
                    <icon name="tag" title="カテゴリ"/>
                    {{ category.name }}
                  </small>
                </li>
              </ul>
            </div>
          </el-card>
        </draggable>
      </el-col>
      <el-col :span="3" class="status status-done" :data-statusid="kanbanStatusIds.done">
        <h2>処理済</h2>
        <draggable @end="endMovingStories" :options="{
            group: 'stories',
            animation: 250,
            delay: 50,
            handle: '.el-card__header',
          }" element="div" id="donestories" ref="donestories" class="story-list done-story-list">
          <el-card v-for="(story, key) in doneStories" :key="story.id" :name="story.id"
            :ref="`story_${key}`" :data-storyid="story.id"
            v-if="!showOnlyAssigned || (story.assignee !== null && story.assignee.id === myself.id)"
            class="story-item"
            :class="{
              urgent: isUrgentStory(story.category),
              assigned: story.assignee !== null && story.assignee.id === myself.id,
              }">
            <template slot="header" class="clearfix">
              <small class="epic-summary">{{ getEpicSummaryById(story.parentIssueId) }}</small>
              {{ story.summary }}
            </template>
            <div class="story-info">
              <ul>
                <li>
                  <small class="story-info-id">
                    <icon name="ticket-alt" title="バグチケット"/>
                    <a :href="generateBacklogUriFromKeyId(story.issueKey)">
                      {{ story.issueKey }}
                    </a>
                  </small>
                </li>
                <li>
                  <small class="story-info-reporter">
                    <icon name="user" title="作成者"/>
                    {{ getCreatedUserName(story) }}
                  </small>
                </li>
                <li>
                  <small v-if="story.dueDate">
                    <icon name="calendar-alt" label="期限"/>
                    {{ dateToString(story.dueDate) }}
                  </small>
                </li>
                <li>
                  <small v-if="story.assignee !== null"
                    class="story-info-assignee">
                    <icon name="user-circle" title="担当者"/>
                    {{ getAssigneeName(story) }}
                  </small>
                </li>
                <li>
                  <small v-for="category in story.category" :key="category.id" class="category">
                    <icon name="tag" title="カテゴリ"/>
                    {{ category.name }}
                  </small>
                </li>
              </ul>
            </div>
          </el-card>
        </draggable>
      </el-col>
      <el-col :span="3" class="status status-completed" :data-statusid="kanbanStatusIds.completed">
        <h2>完了</h2>
        <draggable @end="endMovingStories" :options="{
            group: 'stories',
            animation: 250,
            delay: 50,
            handle: '.el-card__header',
          }" element="div" id="completedstories" ref="completedstories"
          class="story-list completed-story-list">
          <el-card v-for="(story, key) in completedStories" :key="story.id" :name="story.id"
            :ref="`story_${key}`" :data-storyid="story.id"
            v-if="!showOnlyAssigned || (story.assignee !== null && story.assignee.id === myself.id)"
            class="story-item"
            :class="{
              urgent: isUrgentStory(story.category),
              assigned: story.assignee !== null && story.assignee.id === myself.id,
              }">
            <template slot="header" class="clearfix">
              <small class="epic-summary">{{ getEpicSummaryById(story.parentIssueId) }}</small>
              {{ story.summary }}
            </template>
            <div class="story-info">
              <ul>
                <li>
                  <small class="story-info-id">
                    <icon name="ticket-alt" title="バグチケット"/>
                    <a :href="generateBacklogUriFromKeyId(story.issueKey)">
                      {{ story.issueKey }}
                    </a>
                  </small>
                </li>
                <li>
                  <small class="story-info-reporter">
                    <icon name="user" title="作成者"/>
                    {{ getCreatedUserName(story) }}
                  </small>
                </li>
                <li>
                  <small v-if="story.dueDate">
                    <icon name="calendar-alt" label="期限"/>
                    {{ dateToString(story.dueDate) }}
                  </small>
                </li>
                <li>
                  <small v-if="story.assignee !== null"
                    class="story-info-assignee">
                    <icon name="user-circle" title="担当者"/>
                    {{ getAssigneeName(story) }}
                  </small>
                </li>
                <li>
                  <small v-for="category in story.category" :key="category.id" class="category">
                    <icon name="tag" title="カテゴリ"/>
                    {{ category.name }}
                  </small>
                </li>
              </ul>
            </div>
          </el-card>
        </draggable>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
import draggable from 'vuedraggable';
import Icon from 'vue-awesome/components/Icon';
import backlog from '@/utils/backlog';
import date from '@/utils/date';

import 'vue-awesome/icons/calendar';
import 'vue-awesome/icons/tag';
import 'vue-awesome/icons/ticket-alt';
import 'vue-awesome/icons/user';
import 'vue-awesome/icons/users';
import 'vue-awesome/icons/user-circle';

export default {
  name: 'Kanban',
  components: {
    draggable,
    Icon,
  },
  data() {
    return {
      loading: false,
      ongoingMilestoneId: -1,
      showOnlyAssigned: false,
      // TODO: should be customizable
      kanbanStatusIds: {
        todo: 1,
        doing: 2,
        blocked: 0,
        done: 3,
        completed: 4,
      },
    };
  },
  mixins: [
    backlog,
    date,
  ],
  computed: {
    backlogUrgentId() {
      return this.$store.getters.backlogUrgentId;
    },
    todoStories() {
      return this.userStories.filter(story => story.status.id === this.kanbanStatusIds.todo);
    },
    doingStories() {
      return this.userStories.filter(story => story.status.id === this.kanbanStatusIds.doing);
    },
    blockedStories() {
      return this.userStories.filter(story => story.status.id === this.kanbanStatusIds.blocked);
    },
    doneStories() {
      return this.userStories.filter(story => story.status.id === this.kanbanStatusIds.done);
    },
    completedStories() {
      return this.userStories.filter(story => story.status.id === this.kanbanStatusIds.completed);
    },
  },
  methods: {
    endMovingStories(event) {
      if (event.from !== event.to) {
        const storyId = event.item.dataset.storyid;
        const statusId = event.to.closest('.status').dataset.statusid;
        this.updateStatusOfIssue(storyId, statusId);
      }
    },
    getAssigneeName(story) {
      return story.assignee.name;
    },
    getCreatedUserName(story) {
      if (story.createdUser !== undefined) {
        return story.createdUser.name;
      }
      return '';
    },
    getEpicById(epicId) {
      return this.epics.filter(epic => epic.id === epicId)[0];
    },
    getEpicSummaryById(epicId) {
      const epic = this.getEpicById(epicId);
      if (epic === undefined) {
        return '';
      }
      return epic.summary;
    },
    getOngoingMilestoneId() {
      const now = new Date().getTime();
      const timezoneOffset = 9 * 60 * 60 * 1000; // FIXME: JST = +9:00
      return this.milestones.map((milestone) => {
        const tmp = milestone;
        tmp.date = new Date(milestone.startDate).getTime() + timezoneOffset;
        return tmp;
      }).filter(milestone => milestone.date <= now).sort((a, b) => b.date - a.date)[0].id;
    },
    isUrgentStory(categoryArray) {
      return categoryArray.filter(category => category.id === this.backlogUrgentId).length > 0;
    },
    showAllStories() {
      this.showOnlyAssigned = false;
    },
    showAssignedStories() {
      this.showOnlyAssigned = true;
    },
    applyDatastore() {
      this.loading = true;
      this.loadBacklogProject()
        .then(() =>
          this.loadBacklogStatuses())
        .then(() =>
          this.loadBacklogMyself())
        .then(() =>
          this.loadBacklogCategories(this.projects.id))
        .then(() => {
          this.teamCategories = this.categories.filter(
            value =>
              this.$store.getters.backlogCategoryIds.findIndex(
                v =>
                  value.id === v,
              ) >= 0);
          this.workingCategory = this.teamCategories[0].id;
        })
        .then(() =>
          this.loadBacklogMilestones(this.projects.id))
        .then(() => {
          this.ongoingMilestoneId = this.getOngoingMilestoneId();
        })
        .then(() => this.loadBacklogEpics(this.projects.id,
          this.$store.getters.backlogEpicId, this.activeStatusIds,
          this.$store.getters.backlogPriorityVarId,
          20)) // FIXME: Should be customizable
        .then(() => this.loadBacklogOngoingUserStories(this.projects.id,
          this.ongoingMilestoneId))
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

<style scope>
.kanban {
  flex-grow: 1;
}
.status {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.story-list {
  flex-grow: 1;
}
.status h2 {
  font-size: inherit;
  border-bottom: #c0c4cc .1rem solid;
}
.status + .status {
  margin-left: .5rem;
}
.done-story-list,
.completed-story-list {
  font-size: smaller;
}
.status .epic-summary {
  font-size: smaller;
  color: #909399;
  display: block;
}
.el-card__header {
  cursor: grab;
}
.el-card__header,
.el-card__body {
  padding: 0;
}
.story-item {
  border-left: .2rem solid #909399; /* Color: Info */
  margin-bottom: .2rem;
  padding: .2rem .4rem .2rem .6rem;
}
.story-item.assigned {
  border-left-width: .4rem;
  padding-left: .4rem;
}
.story-item.urgent {
  border-left-color: #E6A23C; /* Color: Warning */
}
.status .story-info {
  font-size: smaller;
}
.story-info ul,
.story-info li {
  display: block;
  margin: 0;
  padding: 0;
}
.story-info .category {
  margin-right: .25rem;
}
</style>
