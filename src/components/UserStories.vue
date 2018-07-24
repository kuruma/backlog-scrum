<template>
  <el-main v-loading="loading">
    <el-row class="controllers">
      <el-col :span="12">
        <el-radio-group v-model="workingCategory">
          <el-radio-button v-for="(t, key) in teamCategories"
            :key="`${t.projectId}_${t.id}`" :label="t.id" :checked="key === 0">
            {{ t.name }}
          </el-radio-button>
        </el-radio-group>
      </el-col>
      <el-col justify="end" :span="12" align="right">
        <el-select v-model.number="nextMilestoneId">
          <el-option v-for="m in milestones" :value="m.id" :key="m.id" :label="m.name"/>
        </el-select>
        <el-tooltip content="スプリントバックログを保存" effect="dark" placement="top">
          <el-button @click="syncUserStoriesPriorities">
            <icon name="save" label="スプリントバックログを保存"/>
          </el-button>
        </el-tooltip>
      </el-col>
    </el-row>
    <el-row type="flex" class="backlogs">
      <el-col :span="12" class="backlog">
        <h2>プロダクトバックログ</h2>
        <draggable @end="endMovingStories" :options="{
            group: 'stories',
            animation: 250,
            delay: 50,
            handle: '.handle',
          }" element="el-collapse" id="productbacklogs" ref="productbacklogs"
          accordion class="backlog-list">
          <el-collapse-item v-for="(story, key) in stories" :key="story.id" :name="story.id"
            :ref="`story_${key}`" :data-storyid="story.id"
            class="story-item">
            <template slot="title">
              <el-row type="flex">
                <el-col :span="18">
                  <span class="handle"><icon name="bars"/></span>
                  {{ story.summary }}
                </el-col>
                <el-col justify="end" :span="3" align="right">
                  <small v-if="story.dueDate">
                    <icon name="calendar-alt" label="期限"/>
                    {{ dateToString(story.dueDate) }}
                  </small>
                </el-col>
              </el-row>
            </template>
            <div class="story-details">
              <div class="story-description">
                {{ story.description }}
              </div>
              <div class="story-info">
                <small>
                  <icon name="ticket-alt" title="バグチケット"/>
                  <a :href="generateBacklogUriFromKeyId(story.issueKey)">
                    {{ story.issueKey }}
                  </a>
                </small>
              </div>
            </div>
          </el-collapse-item>
        </draggable>
      </el-col>
      <el-col :span="12" class="backlog">
        <h2>{{ workingCategoryName }}のスプリントバックログ</h2>
        <draggable @end="endMovingStories" :options="{
            group: 'stories',
            animation: 250,
            delay: 50,
            handle: '.handle',
          }" element="el-collapse" id="sprintbacklogs" ref="sprintbacklogs"
          accordion class="backlog-list">
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

import 'vue-awesome/icons/calendar-alt';
import 'vue-awesome/icons/save';
import 'vue-awesome/icons/ticket-alt';

export default {
  name: 'UserStories',
  data() {
    return {
      loading: true,
      nextMilestoneId: -1,
      teamCategories: [],
      workingCategory: {},
    };
  },
  components: {
    draggable,
    Icon,
  },
  mixins: [
    backlog,
    date,
  ],
  computed: {
    stories() {
      // TODO: support user stories as child issues
      // const allStories = this.urgents.concat(this.userStories).concat(this.epics);
      const allStories = this.urgents.concat(this.epics);
      return allStories.filter(
        story => this.isUnassignedOrTeamsIssue(
          story, [this.workingCategory], this.$store.getters.backlogUrgentId));
    },
    workingCategoryName() {
      if (this.teamCategories.length === 0) {
        return '';
      }
      return this.teamCategories.filter(x => x.id === this.workingCategory)[0].name;
    },
  },
  methods: {
    getNextMilestoneId() {
      const now = new Date().getTime();
      const timezoneOffset = 9 * 60 * 60 * 1000; // FIXME: JST = +9:00
      const mss = this.milestones.map((milestone) => {
        const tmp = milestone;
        tmp.date = new Date(milestone.startDate).getTime() + timezoneOffset;
        return tmp;
      }).filter(milestone => milestone.date >= now);
      if (mss.length === 0) {
        return -1;
      }
      return mss.sort((a, b) => a.date - b.date)[0].id;
    },
    syncUserStoriesPriorities() {
      const l = this.$refs.sprintbacklogs.$el.children.length;
      // 未実装、要修正
      const priorityVarId = this.$store.getters.backlogPriorityVarId;
      for (let i = 0; i < l;) {
        const storyId = this.$refs.sprintbacklogs.$el.children[i].dataset.storyid;
        i += 1;
        this.updatePriorityOfIssue(storyId, priorityVarId, i);
      }
    },
    endMovingStories() {
    },
    applyDatastore() {
      this.loading = true;
      this.loadBacklogProject()
        .then(() =>
          this.loadBacklogStatuses())
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
          this.nextMilestoneId = this.getNextMilestoneId();
        })
        .then(() => this.loadBacklogEpics(this.projects.id,
          this.$store.getters.backlogEpicId, this.activeStatusIds,
          this.$store.getters.backlogPriorityVarId,
          100)) // FIXME: Should be customizable
        .then(() => this.loadBacklogUrgentUserStories(this.projects.id,
          this.$store.getters.backlogUrgentId, this.activeStatusIds,
          this.$store.getters.backlogPriorityVarId))
        .then(() =>
          this.loadBacklogUncompletedUserStoriesRelatedEpics(this.projects.id,
            this.$store.getters.backlogUserStoryId, this.activeStatusIds,
            this.$store.getters.backlogPriorityVarId))
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
  display: flex;
  flex-direction: column;
  height: 100%;
}
.handle {
  cursor: grab;
  padding: 1rem;
}
.dragging .handle {
  /* FIXME: Does not applied */
  cursor: grabbing;
}
.backlogs {
  flex-grow: 1;
}
.backlog {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.backlog h2 {
  font-size: inherit;
  font-weight: bold;
}
.backlog .backlog-list {
  flex-grow: 1;
  padding-top: 1.3rem;
}
</style>
