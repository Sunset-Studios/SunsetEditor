import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { register_editor_components } from 'sunset-editor'

const app = createApp(App)
register_editor_components(app)
app.mount('#app')
