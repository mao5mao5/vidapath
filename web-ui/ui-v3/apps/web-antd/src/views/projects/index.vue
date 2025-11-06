<template>
  <div class="p-4">
    <div class="flex justify-between mb-4">
      <a-input-search
        v-model:value="searchString"
        placeholder="Search projects"
        style="width: 300px"
        @search="fetchData"
      />
      <div class="flex gap-4">
        <a-select
          v-model:value="selectedOntologies"
          mode="multiple"
          placeholder="Filter by ontology"
          style="width: 200px"
          :options="availableOntologies"
          :field-names="{ label: 'name', value: 'id' }"
        />
        <a-select
          v-model:value="selectedRoles"
          mode="multiple"
          placeholder="Filter by my role"
          style="width: 200px"
          :options="availableRoles"
        />
        <a-select
          v-model:value="selectedTags"
          mode="multiple"
          placeholder="Filter by tags"
          style="width: 200px"
          :options="availableTags"
          :field-names="{ label: 'name', value: 'id' }"
        />
      </div>
    </div>

    <a-collapse class="mb-4">
      <a-collapse-panel key="1" header="Advanced Filters">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p>Members</p>
            <a-slider v-model:value="boundsMembers" range :max="maxNbMembers" />
          </div>
          <div>
            <p>Images</p>
            <a-slider v-model:value="boundsImages" range :max="maxNbImages" />
          </div>
          <div>
            <p>User Annotations</p>
            <a-slider v-model:value="boundsUserAnnotations" range :max="maxNbUserAnnotations" />
          </div>
          <div>
            <p>Reviewed Annotations</p>
            <a-slider v-model:value="boundsReviewedAnnotations" range :max="maxNbReviewedAnnotations" />
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>

    <a-table :columns="columns" :data-source="data" :loading="loading">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <router-link :to="`/project/${record.id}`">{{ record.name }}</router-link>
        </template>
        <template v-else-if="column.key === 'lastActivity'">
          {{ dayjs(record.lastActivity).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <router-link :to="`/project/${record.id}`" class="ant-btn ant-btn-primary ant-btn-sm">Open</router-link>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { requestClient } from '#/api/request';
import dayjs from 'dayjs';
import { useDebounceFn } from '@vueuse/core';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Members',
    dataIndex: 'membersCount',
    key: 'membersCount',
  },
  {
    title: 'Images',
    dataIndex: 'numberOfImages',
    key: 'numberOfImages',
  },
  {
    title: 'User Annotations',
    dataIndex: 'numberOfAnnotations',
    key: 'numberOfAnnotations',
  },
  {
    title: 'Reviewed Annotations',
    dataIndex: 'numberOfReviewedAnnotations',
    key: 'numberOfReviewedAnnotations',
  },
  {
    title: 'Last Activity',
    dataIndex: 'lastActivity',
    key: 'lastActivity',
  },
  {
    title: 'Action',
    key: 'action',
  },
];

const data = ref([]);
const loading = ref(true);
const searchString = ref('');
const selectedOntologies = ref([]);
const availableOntologies = ref([]);
const selectedRoles = ref([]);
const availableRoles = [
  { label: 'Contributor', value: 'contributor' },
  { label: 'Manager', value: 'manager' },
];
const selectedTags = ref([]);
const availableTags = ref([]);

const boundsMembers = ref([0, 10]);
const maxNbMembers = ref(10);
const boundsImages = ref([0, 10]);
const maxNbImages = ref(10);
const boundsUserAnnotations = ref([0, 100]);
const maxNbUserAnnotations = ref(100);
const boundsReviewedAnnotations = ref([0, 100]);
const maxNbReviewedAnnotations = ref(100);

const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      withMembersCount: true,
      withLastActivity: true,
      withCurrentUserRoles: true,
    };
    if (searchString.value) {
      params.name = { ilike: encodeURIComponent(searchString.value) };
    }
    if (selectedOntologies.value.length > 0) {
      params.ontology = { in: selectedOntologies.value.join(',') };
    }
    if (selectedRoles.value.length > 0) {
      params.currentUserRole = { in: selectedRoles.value.join(',') };
    }
    if (selectedTags.value.length > 0) {
      params.tag = { in: selectedTags.value.join(',') };
    }

    params.numberOfImages = { gte: boundsImages.value[0], lte: boundsImages.value[1] };
    params.membersCount = { gte: boundsMembers.value[0], lte: boundsMembers.value[1] };
    params.numberOfAnnotations = { gte: boundsUserAnnotations.value[0], lte: boundsUserAnnotations.value[1] };
    params.numberOfReviewedAnnotations = { gte: boundsReviewedAnnotations.value[0], lte: boundsReviewedAnnotations.value[1] };

    const response = await requestClient.get({ url: 'project.json', params });
    data.value = response.collection;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const fetchOntologies = async () => {
  try {
    const response = await requestClient.get({ url: 'ontology.json', params: { light: true } });
    availableOntologies.value = response.collection;
  } catch (error) {
    console.error(error);
  }
};

const fetchTags = async () => {
  try {
    const response = await requestClient.get({ url: 'tag.json' });
    availableTags.value = response.collection;
  } catch (error) {
    console.error(error);
  }
};

const fetchMaxFilters = async () => {
  try {
    const response = await requestClient.get({ url: 'bounds/project.json', params: { withMembersCount: true } });
    maxNbMembers.value = Math.max(10, response.members.max);
    maxNbImages.value = Math.max(10, response.numberOfImages.max);
    maxNbUserAnnotations.value = Math.max(100, response.numberOfAnnotations.max);
    maxNbReviewedAnnotations.value = Math.max(100, response.numberOfReviewedAnnotations.max);

    boundsMembers.value = [0, maxNbMembers.value];
    boundsImages.value = [0, maxNbImages.value];
    boundsUserAnnotations.value = [0, maxNbUserAnnotations.value];
    boundsReviewedAnnotations.value = [0, maxNbReviewedAnnotations.value];
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  fetchData();
  fetchOntologies();
  fetchTags();
  fetchMaxFilters();
});

const debouncedFetchData = useDebounceFn(() => {
  fetchData();
}, 500);

watch(searchString, debouncedFetchData);
watch(selectedOntologies, debouncedFetchData);
watch(selectedRoles, debouncedFetchData);
watch(selectedTags, debouncedFetchData);
watch(boundsMembers, debouncedFetchData);
watch(boundsImages, debouncedFetchData);
watch(boundsUserAnnotations, debouncedFetchData);
watch(boundsReviewedAnnotations, debouncedFetchData);

</script>