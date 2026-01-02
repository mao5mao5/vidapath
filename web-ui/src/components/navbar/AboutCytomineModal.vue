<template>
<cytomine-modal-card title="About VIDAPATH" @close="$parent.close()">
    <template>
      <img class="logo" src="@/assets/brands/vidanex-dark.png">

      <dl>
        <dt>{{ $t('version') }}</dt>
        <dd>{{ version || '?' }}</dd>

        <dt>{{ $t('description') }}</dt>
        <dd>An AI-assisted diagnosis and platform for pathological images.</dd>

        <!-- <dt>{{ $t('funding') }}</dt>
        <dd>
          <i18n path="cytomine-funding">
            <a place="link" href="https://uliege.cytomine.org/#fundings" target="_blank">
              https://uliege.cytomine.org/#fundings
            </a>
          </i18n>
        </dd> -->

        <dt>{{ $t('website') }}</dt>
        <dd>
          <i18n path="cytomine-website-info">
            <a place="websiteLink" href="https://vidanex.com/" target="_blank">
              https://vidanex.com/
            </a>
          </i18n>
        </dd>

        <!-- <dt>{{ $t('source-code') }}</dt>
        <dd>
          <i18n path="source-code-info">
            <a place="link" href="https://github.com/cytomine/cytomine" target="_blank">
              {{ $t('github-repository') }}
            </a>
          </i18n>
        </dd> -->

        <!-- <dt>{{ $t('documentation') }}</dt>
        <dd>
          <i18n path="documentation-info">
            <a place="docLink" href="https://doc.uliege.cytomine.org/" target="_blank">
              https://doc.uliege.cytomine.org/
            </a>
          </i18n>
        </dd> -->

        <dt>{{ $t('contact') }}</dt>
        <dd>
          <i18n path="contact-info">
            <a place="contactMail" href="mailto:hi@vidanex.com">
              hi@vidanex.com
            </a>
          </i18n>
        </dd>
      </dl>
    </template>
  </cytomine-modal-card>
</template>

<script>
import constants from '@/utils/constants.js';

import CytomineModalCard from '@/components/utils/CytomineModalCard';

export default {
  name: 'AboutCytomineModal',
  components: {
    CytomineModalCard,
  },
  data() {
    return {
      version: "1.0.0",
    };
  },
};
</script>

<style scoped>
.logo {
  display: block;
  margin: 0 auto;
  max-height: 10rem;
}

.modal-card,
.modal-card-body {
  width: 30vw;
  min-width: 400px;
  font-weight: normal;
  /* background-color: #1e2939; */
  color: white;
}

/* .modal-card::v-deep .modal-card-body {
  background-color: #1e2939;
  color: white;
}

.modal-card::v-deep .modal-card-foot {
  background-color: #1e2939;
  border-top: 1px solid #28364d;
}

.modal-card::v-deep .modal-card-head {
  background-color: #1e2939;
  border-bottom: 1px solid #28364d;
} */

.modal-card::v-deep .modal-card-title {
  color: white;
}

.modal-card::v-deep .button {
  background-color: #3a3a3a;
  border: 1px solid #555;
}

.modal-card::v-deep .button:hover {
  background-color: #4a4a4a;
}

dt {
  float: left;
  width: 12rem;
  text-align: right;
  padding-right: 1rem;
  clear: both;
  font-weight: 600;
  color: white;
}

dd {
  margin-left: 14rem;
  /* background-color: #28364d; */
  margin-bottom: 0.75rem;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

a {
  color: #4db8ff;
}

a:hover {
  color: #66c2ff;
}
</style>