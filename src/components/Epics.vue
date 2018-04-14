<template>
  <div :class="{ 'container-fluid': !isFixedViewMode, container: isFixedViewMode }">
    <div class="row mt-3">
      <div class="col">
        <p class="mt-2 text-center text-muted" v-if="loading">
          <icon name="sync-alt" scale="5" label="Loading..." spin></icon>
        </p>
        <div v-if="!loading"
          class="controllers mb-3 d-flex justify-content-between align-item-center">
          <div>
            <b-button @click="syncEpicsOrder" variant="outline-dark"
              v-b-tooltip.hover title="エピックの優先順位を保存">
              <icon name="save" label="エピックの優先順位を保存"></icon>
            </b-button>
            <b-button @click="loadUserStories" variant="outline-dark"
              v-b-tooltip.hover title="ユーザストーリを読込" v-if="!isShownUserStories">
              <icon name="angle-double-down" title="ユーザストーリを読込"></icon>
            </b-button>
            <b-button @click="hideUserStories" variant="outline-dark"
              v-b-tooltip.hover title="ユーザストーリを隠す" v-if="isShownUserStories">
              <icon name="angle-double-up" title="ユーザストーリを隠す"></icon>
            </b-button>
          </div>
          <div>
            <b-button variant="outline-dark" @click="openAddEpicModal"
              v-b-tooltip.hover title="エピックを追加">
              <icon name="file" label="エピックを追加"></icon>
            </b-button>
          </div>
        </div>
        <draggable @end="endMovingEpic" :options="{
            animation: 250,
            delay: 50,
            handle: '.handle',
            dragClass: 'dragging',
          }" ref="epics"
          element="ol" id="epics" class="list-group">
          <li v-for="(epic, key) in epics" :key="epic.id" :ref="`epic_${key}`"
            class="list-group-item flex-column align-items-start mb-2" :data-epickey="`${key}`">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">
                <span class="handle p-2 pr-4"><icon name="bars"></icon></span>
                {{ epic.summary }}
              </h5>
              <b-button size="sm" :data-epicref="`epic_${key}`"
                v-b-tooltip.hover title="最上位に移動する" @click="moveEpicToTop" class="moveToTopButton">
                <icon name="level-up-alt" lavel="最上位に移動する"/>
              </b-button>
            </div>
            <div class="epic-details mt-2" v-if="isShownUserStories">
              <b-row class="mb-1">
                <b-col>
                  <b-list-group>
                    <b-list-group-item v-for="story in userStories[key]" :key="story.id"
                      :ref="`stories_${key}`"
                      class="d-flex justify-content-between align-item-center align-middle"
                      :class="{ 'list-group-item-dark': story.status.name === '完了' }">
                      {{ story.summary }}
                      <b-badge pill :class="{ 'badge-light': story.status.name === '完了' }">
                        ?
                      </b-badge>
                    </b-list-group-item>
                    <b-list-group-item button @click="openUserStoryModal" :data-epickey="`${key}`">
                      <icon name="plus" class="mr-2" label="ユーザストーリを追加する"/>新しいユーザストーリを追加
                    </b-list-group-item>
                  </b-list-group>
                </b-col>
              </b-row>
              <div class="d-flex justify-content-between align-items-end">
                <small>{{ epic.createdUser.name }}</small>
                <small>{{ epic.created }}</small>
              </div>
            </div>
          </li>
        </draggable>
        <b-modal id="addEpicModal" title="エピックの追加" size="lg"
          ok-title="続けて追加する" cancel-title="追加して閉じる" ref="addEpicModal"
          @ok="addEpicAndContinue" @cancel="addEpic" :busy="!pendingEpicSummaryState"
          @shown="showAddEpicModal" @hide="clearPendingEpic">
          <div class="d-block">
            <b-row class="form-group">
              <b-col>
                <b-form-input ref="epic" v-model="pendingEpic.summary"
                  :state="pendingEpicSummaryState"
                  id="epic" type="text" placeholder="概要"/>
              </b-col>
            </b-row>
          </div>
          <div class="form-group row">
            <b-col>
              <label for="details" class="col-form-label-sm">詳細は</label>
              <b-form-textarea id="details" v-model="pendingEpic.details"
                placeholder="詳細（メモ）" :rows="4" size="sm"></b-form-textarea>
            </b-col>
          </div>
        </b-modal>
        <b-modal id="addUserStoryModal" title="ユーザストーリの追加" size="lg"
          ok-title="続けて追加する" cancel-title="追加して閉じる" ref="addUserStoryModal"
          @ok="addUserStoryAndContinue" @cancel="addUserStory" :busy="!pendingUserStoryState"
          @shown="showAddUserStoryModal" @hide="clearPendingUserStory">
          <div class="d-block">
            <b-row class="form-group">
              <b-col>
                <b-form-input v-model="pendingUserStory.summary"
                  :state="pendingUserStorySummaryState"
                  ref="story" id="story" type="text" placeholder="概要"/>
              </b-col>
            </b-row>
            <p><mark>{{ parentEpic.summary }}</mark>にむけて、</p>
            <div class="form-group row">
              <b-col sm="9" md="10">
                <b-form-input v-model="pendingUserStory.who" id="story4who" type="text"
                  placeholder="嬉しいのは誰？変わる影響を受けるのは誰？" size="sm"/>
              </b-col>
              <span class="col-sm-3 col-md-2 col-form-label-sm">が、</span>
            </div>
            <div class="form-group row">
              <b-col sm="9" md="10">
                <b-form-input v-model="pendingUserStory.why" id="story4why" type="text"
                  placeholder="どんな価値？どう変える/変わる？何が嬉しい？" size="sm"/>
              </b-col>
              <span class="col-sm-3 col-md-2 col-form-label-sm">のために、</span>
            </div>
            <div class="form-group row">
              <b-col sm="9" md="10">
                <b-form-input v-model="pendingUserStory.goal" id="goal4story" type="text"
                  :state="pendingUserStoryGoalState"
                  placeholder="ゴールは？終わったときに何を見せる？何ができている？" size="sm"/>
              </b-col>
              <span class="col-sm-3 col-md-2 col-form-label-sm">をする。</span>
            </div>
            <b-row>
              <b-col>
                <b-button-group size="sm">
                  <b-button v-for="c in categories" :key="`${c.projectId}_${c.id}`"
                    variant="outline-primary" :pressed.sync="c.state">
                    {{ c.name }}
                  </b-button>
                </b-button-group>
              </b-col>
            </b-row>
            <div class="form-group row">
              <b-col>
                <label for="details" class="col-form-label-sm">詳細は</label>
                <b-form-textarea id="details" v-model="pendingUserStory.details"
                  placeholder="詳細（メモ）" :rows="4" size="sm"></b-form-textarea>
              </b-col>
            </div>
          </div>
        </b-modal>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import Icon from 'vue-awesome/components/Icon';
import backlog from '@/utils/backlog';

import 'vue-awesome/icons/save';
import 'vue-awesome/icons/angle-double-down';
import 'vue-awesome/icons/angle-double-up';
import 'vue-awesome/icons/file';
import 'vue-awesome/icons/bars';
import 'vue-awesome/icons/sync-alt';
import 'vue-awesome/icons/level-up-alt';
import 'vue-awesome/icons/plus';

export default {
  name: 'Epics',
  mixins: [backlog],
  data() {
    return {
      firstView: true,
      loading: true,
      epics: [],
      projects: {},
      space: {},
      userStories: {},
      loadedUserStory: {},
      parentEpic: {},
      categories: {},
      pendingUserStory: {
        sumary: '',
        who: '',
        why: '',
        goal: '',
        details: '',
      },
      pendingEpic: {
        summary: '',
        details: '',
      },
      response: {},
      isShownUserStories: false,
    };
  },
  components: {
    draggable,
    Icon,
  },
  computed: {
    pendingEpicSummaryState() {
      return (this.pendingEpic.summary !== undefined
        && this.pendingEpic.summary.length > 0);
    },
    pendingUserStoryState() {
      return (this.pendingUserStorySummaryState
        && this.pendingUserStoryGoalState);
    },
    pendingUserStorySummaryState() {
      return (this.pendingUserStory.summary !== undefined
        && this.pendingUserStory.summary.length > 0);
    },
    pendingUserStoryGoalState() {
      return (this.pendingUserStory.goal !== undefined
        && this.pendingUserStory.goal.length > 0);
    },
  },
  methods: {
    openAddEpicModal() {
      this.$refs.addEpicModal.show();
    },
    openUserStoryModal(event) {
      this.$refs.addUserStoryModal.show();
      this.parentEpic = this.epics[event.target.dataset.epickey];
    },
    addEpic() {
      const param = {
        projectId: this.projects.id,
        issueTypeId: this.$store.getters.backlogEpicId,
        priorityId: 3, // FIXME: Should be customizable
        summary: this.pendingEpic.summary,
        description: this.pendingEpic.details === '' ? '' : this.pendingEpic.details,
      };
      this.postRequestor('issues', param, 'response')
        .then(() => {
          this.epics.push(this.response);
        })
        .then(() => {
          this.moveEpicToTopByIndex(`epic_${this.epics.length - 1}`);
        })
        .then(() => {
          this.response = {};
        });
    },
    addUserStory() {
      console.log(this.pendingUserStory);
      // // TODO: set epic id as parent issue
      // const param = {
      //   'projectId': this.projects.id,
      //   'issueTypeId': this.$store.getters.backlogEpicId,
      //   // priorityId: 2, // FIXME: Should be customizable
      //   // parentIssueId: 2, // Only child task
      //   summary: this.pendingUserStory.summary,
      //   // TODO: append other parameters
      // };
      // this.postRequestor('issues', param, 'response')
      //   .then(() => {
      //     // TODO: insert response issuce to the last of user story list
      //   })
      //   .then(() => {
      //     this.response = {};
      //   });
      // // TODO: impl.
    },
    addEpicAndContinue(event) {
      event.preventDefault();
      this.addEpic();
      // FIXME: Should not touch DOM directry
      document.getElementById('epic').focus();
      this.clearPendingEpic();
    },
    addUserStoryAndContinue(event) {
      event.preventDefault();
      this.addUserStory();
      // FIXME: Should not touch DOM directry
      document.getElementById('story').focus();
      this.clearPendingUserStory();
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
      const btnNode = event.target.closest('button');
      const epicref = btnNode.dataset.epicref;
      this.moveEpicToTopByIndex(epicref);
    },
    moveEpicToTopByIndex(idx) {
      this.$refs.epics.$el.insertBefore(
        this.$refs[idx][0],
        this.$refs.epics.$el.children[0]);
    },
    showAddEpicModal() {
      this.$refs.epic.focus();
    },
    showAddUserStoryModal() {
      this.$refs.story.focus();
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
#epics li:first-child .moveToTopButton {
  display: none;
}
.handle {
  cursor: grab;
}
.dragging .handle {
  /* FIXME: Does not applied */
  cursor: grabbing;
}
</style>
