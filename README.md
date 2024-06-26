# Sunset Editor

An expressive Markdown editor with flexible HTML capabilities. The Sunset editor can be included in any project that needs an easy to use, capable text editor with Markdown syntax parsing.

![editor_demo](./sunset_editor_demo.gif)

### Installation

The Sunset Editor is currently only available for Vue.js projects as a Vue component. To get started, install the Sunset editor package with npm.

```bash
npm install --save @sunsetlearn/sunset-editor
```

### Usage

You can use the `SunsetEditor` component within any other Vue component in your project. Custom element is coming soon in order to support any framework (or simple vanilla JS).

```javascript
<script setup lang="ts">
import { SunsetEditor } from 'sunset-editor'
</script>

<template>
  <div class="top">
    <SunsetEditor :start_with_editing_enabled="true"
    />
  </div>
</template>

<style scoped>
</style>
```

You will also need to register components within your *main.ts*, or wherever you create your Vue app instance.

```javascript
...
import { register_editor_components } from '@sunsetlearn/sunset-editor'

import App from './App.vue'

const app = createApp(App)
register_editor_components(app)
app.mount('#app')
...
```

Finally, make sure to include the Sunset Editor styles within your top-level stylesheet (or separately within your *index.html*) in order to get proper behavior from the Sunset Editor.

```css
@import '@sunsetlearn/sunset-editor/style.css';
...
```

### API

Take a look at the `sunset-editor-test` project to see how most of these properties and functions come together when hooking up the Sunset editor into your Vue application.

#### Component Properties

* `asset_endpoint`: A string with the base path for assets referenced by asset-based components, such as the adjustable image and adjustable video components.
* `start_with_editing_enabled`: Whether the Sunset editor should start in edit mode on startup.
* `stylesheet_string`: A string with stylesheet overrides for any elements within the Sunset editor.
* `current_llm`: A string denoting the LLM API to use if keys are provided. Current values available are 'mistral' and 'openai'.
* `mistral_key`: If using the Mistral LLM API, this is the API key to use for serving LLM requests. For more info, check out [https://mistral.ai/](https://mistral.ai/).
* `oai_key`: If using the OpenAI LLM API, this is the API key to use for serving LLM requests. For more info, check out [https://platform.openai.com/](https://platform.openai.com/).
* `show_text_selection_search`: Whether or not to show a popup on selected text showing search results for the current selection.

#### Component Events

* `componentmodified`: Fired whenever the content is modified, either through the component palette or regular keystrokes.

#### Component Methods

* `export_document_string()`: Exports all contents of the Sunset editor as a single string, to be saved to a file or processed externally.
* `import_document_string(doc: string)`: Imports the contents of an exported Markdown document into the Sunset editor and applies all formatting and transformations.

#### Free Functions

* `register_editor_components(app)`: For Vue.js applications, this function must be called with the app instance as a parameter before mounting the app. This will register all internal Sunset editor components with your Vue application.
* `start_editing()`: Puts the Sunset editor into editing mode.
* `stop_editing()`: Puts the Sunset editor into read-only mode.
