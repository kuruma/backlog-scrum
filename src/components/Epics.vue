<template>
  <div :class="{ 'container-fluid': !isFixedViewMode, container: isFixedViewMode }">
    <div class="row mt-3">
      <div class="col">
        <p class="mt-2 text-center text-muted" v-if="loading">
          <icon name="sync-alt" scale="5" label="Loading..." spin></icon>
        </p>
        <draggable @end="movedEpic" :options="{
            animation: 250,
            delay: 50,
            handle: '.handle',
          }"
          element="ol" id="epics" class="list-group">
          <li v-for="(epic, key) in epics" :key="epic.id"
            class="list-group-item flex-column align-items-start mb-2">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">
                <span class="handle mr-2"><icon name="bars"></icon></span>
                {{ epic.summary }}
              </h5>
              <small>{{ epic.created }}</small>
            </div>
            <div class="epic-details">
              <b-row class="mb-1">
                <b-col>
                  <p class="mb-1">{{ epic.description }}</p>
                </b-col>
              </b-row>
              <small>{{ epic.createdUser.name }} @ {{ epic.created }}</small>
              <div class="float-right">
                <b-button size="sm"
                  v-b-tooltip.hover title="最上位に移動する"
                  @click="moveEpicToTop(key)" v-if="key !== 0">
                  <icon name="level-up-alt" lavel="最上位に移動する"/>
                </b-button>
                <b-button size="sm"
                  @click="setParentEpic(epic)"
                  v-b-tooltip.hover title="ユーザストーリを追加する"
                  v-b-modal.addUserStoryModal>
                  <icon name="plus" label="ユーザストーリを追加する"/>
                </b-button>
              </div>
            </div>
          </li>
        </draggable>
        <b-modal id="addUserStoryModal" title="ユーザストーリの追加" size="lg"
          ok-title="続けて追加する" cancel-title="追加して閉じる"
          @ok="addUserStoryAndContinue" @cancel="addUserStory" @hide="clearPendingUserStory">
          <div class="d-block">
            <b-row class="form-group">
              <b-col>
                <b-form-input v-model="pendingUserStory.summary"
                  id="story" type="text" placeholder="概要"/>
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
                  placeholder="ゴールは？終わったときに何を見せる？何ができている？" size="sm"/>
              </b-col>
              <span class="col-sm-3 col-md-2 col-form-label-sm">をする。</span>
            </div>
            <div class="form-group row">
              <b-col>
                <label for="details" class="col-form-label-sm">詳細は</label>
                <b-form-textarea id="details" v-model="pendingUserStory.details"
                  placeholder="詳細（メモ）" :rows="4" size="sm"></b-form-textarea>
              </b-col>
            </div>
          </div>
        </b-modal>
       <hr>
        {{ space.updated }}
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import Icon from 'vue-awesome/components/Icon';
import backlog from '@/utils/backlog';

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
      epics: {},
      projects: {},
      space: {},
      parentEpic: {},
      pendingUserStory: {},
    };
  },
  components: {
    draggable,
    Icon,
  },
  methods: {
    addUserStory() {
      // TODO: impl.
    },
    addUserStoryAndContinue(event) {
      event.preventDefault();
      this.addUserStory();
      // FIXME: Should not touch DOM directry
      document.getElementById('story').focus();
      this.clearPendingUserStory();
    },
    clearPendingUserStory() {
      Object.keys(this.pendingUserStory).forEach((prop) => {
        this.pendingUserStory[prop] = '';
      });
    },
    movedEpic(event) {
      if (event.from !== event.to) {
        console.log(`${event.from.id} was updated`);
        console.log(`${event.to.id} was updated`);
      } else if (event.oldIndex !== event.newIndex) {
        console.log(`${event.from.id} was updated`);
      }
    },
    moveEpicToTop(key) {
      // FIXME: Should animate epics
      this.epics.unshift(this.epics.splice(key, 1)[0]);
    },
    setParentEpic(epic) {
      this.parentEpic = epic;
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
    console.log(this.$store.getters.projectHash);
    // datastore-updated only called this page is loaded at 1st time
    if (this.projectKey) {
      this.applyDatastore();
    }
  },
};
</script>

<style scoped>
</style>
