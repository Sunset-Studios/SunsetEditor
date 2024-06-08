<script setup lang="ts">
import { onMounted, onUpdated, ref } from 'vue';
import { get_editor_state } from '../core/editor_state'

const { editor_state } = get_editor_state()

const active = ref(false);
const carousel = ref();
const current_result_index = ref(0);
const text_selection_rect = ref({});
const carousel_rect = ref({});

let needs_carousel_rect_update = false

function on_search_results_overlay_clicked(event: MouseEvent) {
    if (!carousel.value.contains(event.target)) {
        editor_state.value.resource_search_results = []
    }
}

function get_text_selection_rect() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    return {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        width: rect.width,
        height: rect.height
    };
}

function prevResult() {
    if (current_result_index.value > 0) {
        current_result_index.value--;
    } else {
        current_result_index.value = editor_state.value.resource_search_results.length - 1;
    }
    needs_carousel_rect_update = true;
}

function nextResult() {
    if (current_result_index.value < editor_state.value.resource_search_results.length - 1) {
        current_result_index.value++;
    } else {
        current_result_index.value = 0;
    }
    needs_carousel_rect_update = true;
}

onMounted(() => {
    carousel_rect.value = carousel.value.getBoundingClientRect()
    text_selection_rect.value = get_text_selection_rect() as any
    active.value = true
})

onUpdated(() => {
    if (needs_carousel_rect_update) {
        needs_carousel_rect_update = false
        carousel_rect.value = carousel.value.getBoundingClientRect()
    }
})
</script>

<template>
    <div class="search-result-container" @click="on_search_results_overlay_clicked" :class="{ active: active }">
        <div class="carousel" ref="carousel"
            :style="{ top: `${(text_selection_rect as any).top - (carousel_rect as any).height - 10}px`, left: `${(text_selection_rect as any).left - (carousel_rect as any).width * 0.5 + (text_selection_rect as any).width * 0.5}px` }">
            <div class="carousel-header">
                <button @click="prevResult" class="carousel-button">
                    <i class="fa-solid fa-caret-left"></i>
                </button>
                <div class="carousel-content">
                    <a :href="(editor_state.resource_search_results[current_result_index] as any).link" target="_blank">
                        {{ (editor_state.resource_search_results[current_result_index] as any).title }}
                    </a>
                </div>
                <button @click="nextResult" class="carousel-button">
                    <i class="fa-solid fa-caret-right"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.search-result-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.0;
    transition: 0.15s all;
}

.search-result-container.active {
    opacity: 1.0;
}

.carousel {
    position: absolute;
    display: flex;
    align-items: center;
    background-color: #2b2a2a;
    border-radius: 5px;
}

.carousel::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #2b2a2a;
}

.carousel-header {
    display: flex;
    height: 100%;
    color: white;
}

.carousel-button {
    background-color: transparent;
    color: #a3a3a3;
    border: none;
    padding: 10px;
    cursor: pointer;
    border-radius: 0;
}

.carousel-button:focus-visible,
.carousel-button:focus {
    outline: none;
}

.carousel-content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 10px;
}

.carousel-content a {
    color: white;
    font-weight: bold;
}

.search-result {
    width: 100%;
    height: 100%;
}
</style>
