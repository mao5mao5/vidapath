<!-- Copyright (c) 2009-2022. Authors: see NOTICE file.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.-->

<template>

  <div class="image-selector-wrapper" :class="{ collapsed: collapsed }">
      <div>
        <div class="card" v-for="image in images" :key="image.id" :class="{active: alreadyAdded(image)}">
          <a
            class="card-image"
            @click="addImage(image)"
            :style="'background-image: url(' + appendShortTermToken(imageThumbUrl(image), shortTermToken) + ')'"
          ></a>
          <div class="card-content" @click="addImage(image)">
           <image-name :image="image" />
          </div>
        </div>
        <button class="button" v-if="nbImagesDisplayed < nbFilteredImages" @click="more()">
          {{$t('button-more')}}
        </button>
        <div class="space">&nbsp;</div>
      </div>
  </div>
</template>

<script>
import {get,syncMultiselectFilter} from '@/utils/store-helpers';
import {IMAGE_FORMAT} from '@/utils/image-utils';

import ImageName from '@/components/image/ImageName';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import {ImageGroupCollection, ImageInstanceCollection, TagCollection} from '@/api';
import _ from 'lodash';
import {appendShortTermToken} from '@/utils/token-utils.js';
import {ref} from 'vue';

const storeOptions = {rootModuleProp: 'storeModule'};
const localSyncMultiselectFilter = (filterName, options) => syncMultiselectFilter(null, filterName, options, storeOptions);

export default {
  name: 'image-selector',
  components: {
    ImageName,
    CytomineMultiselect
  },
  setup() {
    const collapsed = ref(true);
    return { collapsed };
  },
  data() {
    return {
      images: [],
      availableTags:[],
      imageGroups: [],
      searchString: '',
      selectedImageGroups: [],
      nbImagesDisplayed: 20,
      nbFilteredImages: 0,
      loading: true,
      error: false
    };
  },
  computed: {
    project: get('currentProject/project'),
    shortTermToken: get('currentUser/shortTermToken'),
    selectedTags: localSyncMultiselectFilter('selectedTags', 'availableTags'),
    storeModule() {
      return this.$store.getters['currentProject/currentProjectModule'] + 'listImages';
    },
    viewerModule() {
      return this.$store.getters['currentProject/currentViewerModule'];
    },
    // imageSelectorEnabled has been replaced by collapsed state in a-layout-sider
    // The store state is now synchronized with the collapsed property
    collapsed: {
      get() {
        // Initialize from store if available, otherwise use default value
        const viewer = this.$store.getters['currentProject/currentViewer'];
        if (viewer && viewer.imageSelector !== undefined) {
          return !viewer.imageSelector;
        }
        return true; // default to collapsed
      },
      set(value) {
        // Update store when collapsed state changes
        this.$store.commit(this.viewerModule + 'setImageSelector', !value);
      }
    },
    viewerImagesIds() {
      return Object.values(this.$store.getters['currentProject/currentViewer'].images).map(image => image.imageInstance.id);
    },
    availableImageGroups() {
      return [{id: 'null', name: this.$t('no-image-group')}, ...this.imageGroups];
    }
  },
  watch: {
    searchString() {
      this.fetchImages();
    },
    selectedImageGroups() {
      this.fetchImages();
    },
    nbImagesDisplayed() {
      this.fetchImages();
    },
    async selectedTags() {
      if (!this.selectedTags.length) {
        this.images = [];
      } else {
        await this.fetchImages();
      }
    }
  },
  methods: {
    appendShortTermToken,
    debounceSearchString: _.debounce(async function (value) {
      this.searchString = value;
    }, 500),
    async addImage(image) {
      try {
        // 检查图像是否已经添加到查看器中
        let existingImageIndex = this.viewerImagesIds.indexOf(image.id);
        if (existingImageIndex !== -1) {
          // 如果图像已经存在，切换到该图像
          let imageIndexes = Object.keys(this.$store.getters['currentProject/currentViewer'].images);
          let imageIndex = imageIndexes.find(index => 
            this.$store.getters['currentProject/currentViewer'].images[index].imageInstance.id === image.id
          );
          this.$store.commit(this.viewerModule + 'setActiveImage', imageIndex);
          this.imageSelectorEnabled = false;
        } else {
          // 如果图像不存在，替换当前活动图像
          await image.fetch(); // refetch image to ensure we have latest version
          let slice = await image.fetchReferenceSlice();
          let activeImageIndex = this.$store.getters['currentProject/currentViewer'].activeImage;
          await this.$store.dispatch(`${this.viewerModule}images/${activeImageIndex}/setImageInstance`, {image, slices: [slice]});
          this.imageSelectorEnabled = false;
        }
      } catch (error) {
        console.log(error);
        // this.$notify({type: 'error', text: this.$t('notif-error-add-viewer-image')});
      }
    },
    async fetchImages(loading = true) {
      if (loading) {
        this.loading = true;
      }

      try {
        let collection = new ImageInstanceCollection({
          filterKey: 'project',
          filterValue: this.project.id,
          max: this.nbImagesDisplayed
        });

        if (this.searchString) {
          collection['name'] = {
            ilike: encodeURIComponent(this.searchString)
          };
        }

        if (this.selectedTags.length > 0) {
          collection['tag'] = {
            in: this.selectedTags.map(option => option.id).join()
          };
        }

        if (this.selectedImageGroups.length > 0 && this.selectedImageGroups.length !== this.availableImageGroups.length) {
          collection['imageGroup'] = {
            in: this.selectedImageGroups.map(option => option.id).join()
          };
        }

        if (this.selectedImageGroups.length === 0) {
          this.images = [];
          this.nbFilteredImages = 0;
        } else {
          let data = (await collection.fetchPage(0));
          this.images = data.array;
          this.nbFilteredImages = data.totalNbItems;
        }
      } catch (error) {
        console.log(error);
        this.error = true;
      }
      if (loading) {
        this.loading = false;
      }
    },
    async fetchImageGroups() {
      this.imageGroups = (await ImageGroupCollection.fetchAll({
        filterKey: 'project',
        filterValue: this.project.id
      })).array.filter(group => group.numberOfImages > 0);
    },
    async fetchTags() {
      this.availableTags = [{id: 'null', name: this.$t('no-tag')}, ...(await TagCollection.fetchAll()).array];
    },

    more() {
      this.nbImagesDisplayed += 20;
    },

    toggle() {
      this.imageSelectorEnabled = !this.imageSelectorEnabled;
    },

    shortkeyHandler(key) {
      if (key === 'toggle-add-image') {
        this.toggle();
      }
    },

    alreadyAdded(image) {
      return this.viewerImagesIds.includes(image.id);
    },
    imageThumbUrl(image) {
      return image.thumbURL(256, IMAGE_FORMAT);
    }
  },
  async created() {
    this.loading = true;
    await Promise.all([
      this.fetchImageGroups(),
      this.fetchImages(false),
      this.fetchTags()
    ]);
    this.selectedImageGroups = this.availableImageGroups.slice();
    this.loading = false;
  },
  mounted() {
    this.$eventBus.$on('shortkeyEvent', this.shortkeyHandler);
  },
  beforeDestroy() {
    this.$eventBus.$off('shortkeyEvent', this.shortkeyHandler);
  }
};
</script>

<style scoped>
.image-selector-wrapper {
  background-color: #1e2938;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  z-index: 150;
  overflow: auto;
  border: 1px solid #3e3e3e;
}



.header {
  padding: 0.75em;
  padding-bottom: 0;
  padding-top: 0;
  display: flex;
  justify-content: space-between;
}

.header div {
  display: flex;
  align-items: baseline;
}

.header .filter-label {
  margin-right: 0.5em;
}

.search-images {
  margin-right: 1em;
}

.search {
  margin-top: 0.25em;
}

.filters {
  display: flex;
  padding: 0;
  background: None;
}

.filter-label {
  font-size: 0.9em;
  margin-top: 0.7rem;
  margin-left: 1em;
  margin-right: 0.5em;
}

.delete {
  margin-top: 1.2rem;
}

.image-selector {
  width: 100%;
  overflow: auto;
  display: flex;
  align-items: center;
  flex: 1;
}

.card {
  background-color: #101828;
  display: inline-block;
  min-width: 12em;
  flex: 0;
  box-sizing: border-box;
  margin: 0.75em;
  border: 2px solid #203153;
  border-radius: 8px;
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.card:hover {
  border-color: #409eff; /* 鼠标悬停时显示蓝色边框 */
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.2); /* 添加蓝色阴影 */
}

.card.active {
  border-color: #409eff; /* 选中状态显示蓝色边框 */
}

.card-image {
  display: inline-block;
  width: 100%;
  height: 9.5em;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: transparent;
  border-radius: 8px;
}

.card-content {
  padding: 0.1em;
  font-size: 0.8rem;
  overflow-wrap: break-word;
  overflow: hidden;
  text-align: center;
  color: white !important; /* 提高样式优先级 */
  height: 2em;
}

.content {
  text-align: center;
  color: white !important; /* 提高样式优先级 */
  font-size: 0.8rem;
  overflow-wrap: break-word;
  overflow: hidden;
  height: 5em;
}

.space {
  margin-left: 0.5em;
}

/* .image-selector-button has been removed as it's no longer needed with a-layout-sider */

/* .active {
  box-shadow: 0 2px 3px rgba(16, 133, 210, 0.75), 0 0 0 1px rgba(39, 120, 173, 0.75);
  font-weight: 600;
} */

.no-result {
  margin: 2em;
}
</style>
