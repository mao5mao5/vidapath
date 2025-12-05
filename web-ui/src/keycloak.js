import Keycloak from 'keycloak-js';

// 检查URL中是否有access_token参数（考虑hash模式）
function getQueryParam(param) {
  // 首先尝试从location.search获取（常规查询参数）
  let queryParams = new URLSearchParams(window.location.search);
  if (queryParams.has(param)) {
    return queryParams.get(param);
  }
  
  // 如果在search中找不到，尝试从hash中获取（Vue Router hash模式）
  const hash = window.location.hash;
  if (hash.includes('?')) {
    const queryString = hash.split('?')[1];
    if (queryString) {
      queryParams = new URLSearchParams(queryString);
      if (queryParams.has(param)) {
        return queryParams.get(param);
      }
    }
  }
  
  return null;
}

const hasTemporaryToken = !!getQueryParam('access_token');

const initOptions = {
  url: `${window.location.origin}/iam`,
  realm: 'vidapath',
  clientId: 'core',
  enableLogging: true
};

const _keycloak = new Keycloak(initOptions);

// 为_keycloak对象添加一个属性，标记是否存在临时访问令牌
_keycloak.hasTemporaryToken = hasTemporaryToken;

const plugin = {
  install: Vue => {
    Vue.$keycloak = _keycloak;
  },
};
plugin.install = Vue => {
  Vue.$keycloak = _keycloak;
  Object.defineProperties(Vue.prototype, {
    $keycloak: {
      get() {
        return _keycloak;
      },
    },
  });
};

export default plugin;