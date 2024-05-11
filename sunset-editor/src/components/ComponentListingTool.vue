<script setup lang="ts">
import { onMounted, onUnmounted, ref, Ref } from 'vue'
import { registered_component_infos } from '../core/component_setup'
import { get_editor_state } from '../core/editor_state'
import { get_global_dispatcher } from '../core/global_events'

const { editor_state } = get_editor_state()
const { global_dispatcher } = get_global_dispatcher()

let active = ref(false)
let search = ref()

let unfiltered: Ref<string[]> = ref([])
let filtered: Ref<string[]> = ref([])

let selected_item = ref(0)
let done = false

function on_search(evt: Event) {
    filtered.value = []
    for (const value of unfiltered.value) {
        const search_text = (evt?.target as HTMLInputElement)?.value ?? ''
        if (value.toLowerCase().includes(search_text.toLowerCase()) && registered_component_infos.value[value].component) {
            filtered.value.push(value)
        }
    }
    selected_item.value = 0
}

function highlight_item(index: number) {
    selected_item.value = index
}

function on_document_key_down(evt: KeyboardEvent) {
    if (evt.key === "ArrowDown") {
        selected_item.value = Math.min(filtered.value.length - 1, selected_item.value + 1)
    } else if (evt.key === "ArrowUp") {
        selected_item.value = Math.max(0, selected_item.value - 1)
    } else if (evt.key === "Enter") {
        select_current_item()
    } else if (evt.key === "Escape") {
        done = true
    }
}

function on_document_key_up(_: KeyboardEvent) {
    if (done) {
        global_dispatcher.dispatch('dismiss_palette_selection')
        editor_state.value.showing_component_listing = false
    }
}

function select_current_item() {
    const comp_info = registered_component_infos.value[filtered.value[selected_item.value]]
    if (comp_info) {
        global_dispatcher.dispatch('component_pallette_selection', comp_info['raw_template'], comp_info['insert_offset'])
        done = true
    }
}

onMounted(() => {
    search.value.focus()
    active.value = true

    unfiltered.value = Object.keys(registered_component_infos.value)
    unfiltered.value.sort()

    document.addEventListener("keydown", on_document_key_down, { passive: false })
    document.addEventListener("keyup", on_document_key_up, { passive: false })
})

onUnmounted(() => {
    document.removeEventListener("keyup", on_document_key_up)
    document.removeEventListener("keydown", on_document_key_down)
})
</script>

<template>
    <div class="components-modal-container" :class="{ active: active }">
        <div class="components-modal">
            <input type="text" class="search" ref="search" @input="on_search"/>
            <div class="component-option" v-for="(comp, index) in filtered" :class="{ selected: index === selected_item }" @mouseover="highlight_item(index)" @click="select_current_item">
                {{ comp }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.components-modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    transition: 0.15s all;
    opacity: 0.0;
}
.components-modal-container:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #130031;
    mask-image: radial-gradient(circle, rgba(0, 0, 0, 0.4) 50%, black 100%);
}
.components-modal-container.active {
    opacity: 1.0;
}
.components-modal {
    position: relative;
    margin: 0 auto;
    top: 100px;
    width: 75%;
    background-color: #130031;
    z-index: 10;
    transition: 0.15s all;
    filter: drop-shadow();
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    overflow-x: hidden;
    max-height: 75%;
    border-radius: 15px;
}
.search {
    width: 100%;
    height: 65px;
    color: #cbc1bb;
    font-weight: 700;
    font-size: 24pt;
    padding: 15px;
    background-color: #0f051e;
    border: none;
    outline: none;
    filter: drop-shadow(2px 4px 6px #0f051e);
    -webkit-filter: drop-shadow(2px 4px 6px #0f051e);
}
.component-option {
    width: 100%;
    height: 65px;
    display: flex;
    align-items: center;
    color: #cbc1bb;
    font-weight: 700;
    font-size: 20pt;
    padding: 15px;
    background-color: #0f051e;
    border: none;
    border-top: 1px solid #48464d45;
    filter: drop-shadow(2px 4px 6px #0f051e);
    -webkit-filter: drop-shadow(2px 4px 6px #0f051e);
}
.component-option.selected {
    background-color: #271149;
}
.component-option:hover {
    cursor: pointer;
}
</style>