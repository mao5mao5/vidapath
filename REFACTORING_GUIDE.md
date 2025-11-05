
# Refactoring Guide: Vue 2 to Vue 3

This document outlines the steps taken to refactor a Vue 2 component (`ListProjects.vue`) into a Vue 3 component within the `ui-v3` project. It can be used as a guide for future refactoring tasks.

## 1. Understand the Old Component

Before refactoring, it's crucial to have a thorough understanding of the component to be replaced.

*   **Identify the Component:** Locate the Vue 2 component file that needs to be refactored. In this case, it was `web-ui/ui/src/components/project/ListProjects.vue`.
*   **Analyze the Template:**
    *   Examine the HTML structure to understand the layout and UI elements.
    *   Identify the UI components used and their libraries (e.g., Buefy components like `b-table`, `b-input`, etc.).
*   **Analyze the Script:**
    *   Understand the component's logic and data flow.
    *   Identify how data is fetched (e.g., `cytomine-client`).
    *   Analyze the state management (`vuex` in this case).
    *   Understand user interactions and event handling.

## 2. Set Up the New Component in `ui-v3`

Next, prepare the foundation for the new component in the `ui-v3` project.

*   **Directory Structure:**
    *   Familiarize yourself with the `ui-v3` project structure. New pages are typically located in `apps/web-antd/src/views`.
    *   Create a new directory for the feature you are refactoring (e.g., `apps/web-antd/src/views/projects`).
*   **Create the Component:** Create a new `.vue` file for your component (e.g., `index.vue`).
*   **Routing:**
    *   Add a new route in the `ui-v3` router. Dynamic routes are located in `apps/web-antd/src/router/routes/modules`.
    *   Create a new file (e.g., `projects.ts`) and define the route, pointing to your new component.
*   **Localization:**
    *   If the new page has a title or other text that needs to be translated, add the necessary keys to the localization files in `apps/web-antd/src/locales/langs`.

## 3. Re-implement the UI

Translate the UI from the old component to the new one, using the new component library (Ant Design Vue).

*   **Component Mapping:** Replace components from the old library with their equivalents in Ant Design Vue.
    *   `b-table` => `a-table`
    *   `b-input` => `a-input`
    *   `b-select` => `a-select`
    *   `b-slider` => `a-slider`
    *   `b-collapse` => `a-collapse`
*   **Layout:** Use the new project's layout system (e.g., Tailwind CSS utility classes) to structure the component's UI.

## 4. Re-implement the Logic

Rewrite the component's logic using the modern tech stack of `ui-v3`.

*   **Composition API:** Use Vue 3's Composition API (`<script setup>`) for a more organized and reusable code structure.
*   **API Calls:**
    *   **Identify Endpoints:** Determine the API endpoints used by the old component. This can often be done by inspecting the source code of the API client it uses (e.g., `cytomine-client`).
    *   **Use `@vben/request`:** Use the standardized `@vben/request` client to make API calls to the identified endpoints.
*   **State Management:**
    *   For component-level state, use `ref` and `reactive`.
    *   For global state, use the project's Pinia store.
*   **User Interactions:**
    *   Re-implement event handlers for user interactions like search and filtering.
    *   Leverage utility libraries from the new project, such as `@vueuse/core` for functions like `useDebounceFn`.

## 5. Refine and Improve

Finally, polish the new component and look for opportunities for improvement.

*   **Add Enhancements:** Introduce improvements that may have been missing in the original component, such as debouncing filters to prevent excessive API calls.
*   **Adhere to Conventions:** Ensure the new component follows the coding style, formatting, and conventions of the `ui-v3` project.
