import * as Vue from "vue";
import {
  createRouter,
  createWebHistory,
  RouterLink,
  RouterView,
} from "vue-router";
import { createPinia } from "pinia";
import { useFunnelStore } from "../stores/funnel.ts";
import "../assets/css/main.css";
Object.assign(globalThis, Vue, {
  useFunnelStore,
  useHead: (head) => (document.title = head.title),
  navigateTo: (to) => router.push(to),
  defineNuxtRouteMiddleware: (fn) => fn,
});
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import("../pages/index.vue") },
    { path: "/schedule", component: () => import("../pages/schedule.vue") },
    { path: "/confirmed", component: () => import("../pages/confirmed.vue") },
  ],
});
const app = Vue.createApp({ render: () => Vue.h(RouterView) });
app.use(createPinia());
app.use(router);
app.component("NuxtLink", RouterLink);
router.beforeEach((to) => {
  const store = useFunnelStore();
  store.hydrate();
  if (to.path === "/schedule" && !store.application) return "/";
  if (to.path === "/confirmed" && !store.booking) return "/schedule";
});
app.mount("#app");
