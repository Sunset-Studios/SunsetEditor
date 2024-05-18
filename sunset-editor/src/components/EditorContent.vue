<script setup lang="ts">
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import '@fortawesome/fontawesome-free/css/solid.css'
import '@/assets/custom_darcula_hljs.css'
import { ref, onUpdated, onMounted, onUnmounted, watch, Ref, RenderFunction, compile } from 'vue'
import { transform_standalone } from '../utility/content_processing_utils'
import { get_global_dispatcher } from '../core/global_events'
import { get_editor_state } from '../core/editor_state'
import { log } from '../utility/logging'
import { escape_html, unescape_html } from '../utility/html_utils'
import { v4 as uuidv4 } from 'uuid'

const emit = defineEmits(['contentmodified', 'on_editor_touch_start', 'on_editor_touch_move', 'on_editor_touch_end'])

const { global_dispatcher } = get_global_dispatcher()
const { editor_state } = get_editor_state()

let compiled_editor_content = ref()
let editor_content = ref()
let current_editing_element = ref()

let current_editing_element_id = ''
let tabbed_preview_element_id = ''
let current_caret_position = 0
let component_pallette_insertion_position = -1
let all_child_elements: any[] = []
let all_element_ids: string[] = []
let element_raw_texts: Map<string, string> = new Map<string, string>()
let mutation_observer: MutationObserver = new MutationObserver(on_editor_content_mutated)
let compiled_content: Ref<RenderFunction> = ref(() => {})

let skip_selection_change: boolean = false
let current_stylesheet: CSSStyleSheet | null = null

function generate_new_id() {
    return uuidv4().slice(0, 8)
}

function get_caret_position(div: any) {
    let caretPos = 0
    const sel = window.getSelection()
    if (div && sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        const preCaretRange = range.cloneRange()
        preCaretRange.selectNodeContents(div)
        preCaretRange.setEnd(range.endContainer, range.endOffset)
        caretPos = preCaretRange.toString().length
    }
    return caretPos
}

function get_caret_node() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        return range.endContainer
    }
    return null
}

function set_caret_position(div: any, position: number) {
    function traverseNodes(node: any, position: number) {
        let char_count = 0

        for (let i = 0; i < node.childNodes.length; i++) {
            const child_node = node.childNodes[i]

            if (child_node.nodeType === 3) {  // Text node
                const next_char_count = char_count + child_node.length
                if (next_char_count >= position) {
                    return { node: child_node, position: position - char_count }
                }
                char_count = next_char_count
            }
            else if (child_node.nodeType === 1) {  // Element node
                const result: any = traverseNodes(child_node, position - char_count)
                if (result) {
                    return result
                }
                char_count += child_node.textContent.length
            }
        }

        return null
    }

    const result = traverseNodes(div, position)

    if (result) {
        const range = document.createRange()
        const sel = window.getSelection()
        if (sel) {
            range.setStart(result.node, result.position)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
        }
    }
}

function copy_code_snippet(event: MouseEvent) {
    const parent_pre = (event.target as HTMLElement)?.parentElement
    if (parent_pre) {
        const code_el = parent_pre.getElementsByTagName('code')[0]
        navigator.clipboard.writeText(code_el.innerText)
    }
}

function update_all_pre_elements() {
    let all_pre_elements = editor_content.value?.getElementsByTagName('pre')
    if (all_pre_elements) {
        for (const pre_el of all_pre_elements) {
            const is_current_element = current_editing_element_id === pre_el.getAttribute('id')
            if (is_current_element) {
                if (pre_el.querySelector('.copy-button')) {
                    const copy_button = pre_el.querySelector('.copy-button')
                    if (copy_button) {
                        copy_button.remove()
                    }
                }
            } else {
                if (!pre_el.querySelector('.copy-button')) {
                    const copy_button = document.createElement('div')
                    copy_button.classList.add('copy-button')
                    copy_button.addEventListener('click', copy_code_snippet)
                    const fa_icon = document.createElement('i')
                    fa_icon.classList.add('fa-solid', 'fa-copy', 'centered-icon')
                    copy_button.appendChild(fa_icon)
                    pre_el.prepend(copy_button)
                }
            }
        }
    }
}

function get_direct_child_parent(root: any, element: any) {
    if (!element || element === root || element.parentNode === root) {
        return element
    }

    let parent = element.parentNode
    while (parent && parent.parentNode !== root) {
        parent = parent.parentNode
    }

    return parent
}

function set_current_element_active_class() {
    for (const el of all_child_elements) {
        el.classList.remove('active')
        el.classList.remove('empty')

        if (el.getAttribute('id') === current_editing_element_id && current_editing_element_id !== tabbed_preview_element_id) {
            el.classList.add('active')
            if (el.innerHTML === '\u200B') {
                el.classList.add('empty')
            }
        }
    }
}

function manage_zero_width_space(html: string) {
    let new_html = html
    let removed = false
    if (html.length === 0 || html === '<br>' || html === '\n' || html === '') {
        new_html = '\u200B' 
    }
    if (/\u200B/.test(html) && html.replace(/\u200B/, '').length > 0) {
        new_html = html.replace(/\u200B/, '')
        removed = true
    }
    return { new_html, removed }
}

async function initialize_editor_content() {
    all_element_ids.push(generate_new_id())
    editor_content.value.innerHTML += '<p></p>'
    editor_content.value.focus()
}

async function compile_all_content() {
    log(`> compiling all content`, 'EDITOR_LIFECYCLE')
    let compiled = ''
    for (const el of all_child_elements) {
        compiled += el.outerHTML
    }
    compiled_content.value = compile(compiled, { whitespace: 'preserve' })
}

function replace_editable_with_compiled() {
    if (editor_content.value) {
        for (const child of editor_content.value.childNodes) {
            child.remove()
        }

        let current_el: any = null
        for (let i = 0; i < compiled_editor_content.value.children.length; ++i) {
            const child = compiled_editor_content.value.children[i]
            const cloned_child = child.cloneNode(true)
            if (i >= editor_content.value.children.length) {
                editor_content.value.appendChild(cloned_child)
            } else {
                editor_content.value.children[i].replaceWith(cloned_child)
            }
            if (editor_content.value.children[i].getAttribute('id') === current_editing_element_id) {
                current_el = editor_content.value.children[i]
            }
        }

        if (current_el) {
            set_caret_position(current_el, Math.min(current_caret_position, current_el.innerHTML.length))
        }
    }
}

function export_document_string() {
    let doc_string = ''
    for (const id of all_element_ids) {
        doc_string += `${element_raw_texts.get(id)}\n\n\n`
    }
    return doc_string
}

async function import_document_string(doc: string) {
    log(`> importing document string`, 'EDITOR_LIFECYCLE')

    for (const child of all_child_elements) {
        editor_content.value.removeChild(child)
    }

    let parts = doc.split('\n\n\n')

    all_element_ids = []
    all_child_elements = []
    element_raw_texts.clear()

    // Populate id and raw text data structures
    for (const _part of parts) {
        all_element_ids.push(generate_new_id())
        editor_content.value.appendChild(document.createElement('div'))
    }

    for (let i = 0; i < parts.length; ++i) {
        element_raw_texts.set(all_element_ids[i], parts[i])
    }

    // Perform HTML transformation by adding new nodes
    for (let i = 0; i < parts.length; ++i) {
        const part = parts[i]
        const range = document.createRange()
        range.selectNodeContents(editor_content.value.children[i])
        let transformed = await transform_standalone(unescape_html(part))
        const node = range.createContextualFragment(transformed)
        editor_content.value.children[i].replaceChildren(node)
    }
    
    // Generate additional new element at the back
    {
        const part = '\u200B'
        const id = generate_new_id()
        all_element_ids.push(id)
        element_raw_texts.set(id, part)
        editor_content.value.appendChild(document.createElement('div'))
        const new_el = editor_content.value.children[editor_content.value.children.length - 1]
        
        const range = document.createRange()
        range.selectNodeContents(new_el)
        let transformed = await transform_standalone(part)
        const node = range.createContextualFragment(transformed)
        new_el.replaceChildren(node)
        
        current_editing_element.value = new_el
    }

    compile_all_content()
}

async function transform_editor_content(element: any, to_markdown: boolean = false) {
    log(`> transform editor content: to_markdown: ${to_markdown}`, 'EDITOR_LIFECYCLE')

    if (!editor_content.value || !element) {
        return
    }

    const id = element.getAttribute('id')
    
    if (to_markdown) {
        const raw_text = element_raw_texts.get(id)
        element.innerHTML = raw_text
    } else {
        element_raw_texts.set(id, escape_html(element.textContent))
        let transformed = await transform_standalone(element.textContent)
        const range = document.createRange()
        range.selectNodeContents(element)
        const node = range.createContextualFragment(transformed)
        element.replaceChildren(node)
    }
}

global_dispatcher.on('component_pallette_selection', add_selected_pallette_content)
function add_selected_pallette_content(template: string, insert_offset: number = 0) {
    if (editor_content.value) {
        let base_html = current_editing_element.value.innerText.slice(0, current_caret_position)
            + template 
            + current_editing_element.value.innerText.slice(current_caret_position)

        base_html = base_html.replace(/\u200B/, '')
        const escaped_html = escape_html(base_html) 
        element_raw_texts.set(current_editing_element_id, escaped_html)

        component_pallette_insertion_position = current_caret_position + template.length - (insert_offset + 1)

        emit('contentmodified')
    }
}

global_dispatcher.on('dismiss_palette_selection', on_pallette_dismissed)
function on_pallette_dismissed() {
    if (component_pallette_insertion_position >= 0) {
        current_caret_position = component_pallette_insertion_position
        component_pallette_insertion_position = -1
        on_content_element_focus_changed('', current_editing_element_id)
    }
}

async function on_editor_content_mutated(mutation_list: MutationRecord[], _: MutationObserver) {
    if (mutation_list.length > 0 && mutation_list.find((val) => val.type === "childList")) {
        log('> editor content mutated', 'HTML_LIFECYCLE')
    }

    let mutated: boolean = false

    for (const mutation of mutation_list) {
        if (mutation.type === "childList") {
            if (mutation.removedNodes.length > 0 || mutation.addedNodes.length > 0) {
                mutated = true
                break
            }
        }
    }

    if (mutated) {
        // Update the tracked child elements list once it is mutated
        all_child_elements = Array.from(editor_content.value.children)
  
        // Make sure to set the appropriate element ids on new elements so contents can be fetched correctly
        // Element references change when DOM changes, so we can't reliably store and check those as map values instead.
        for (let i = 0; i < all_child_elements.length; ++i) {
            let el_id = i <= all_element_ids.length - 1 ? all_element_ids[i] : ''
   
            const el = all_child_elements[i]
            if (!el.getAttribute('id')) {
                el.setAttribute('id', el_id)
            }
    
            if (!element_raw_texts.has(el_id)) {
                element_raw_texts.set(el_id, '&ZeroWidthSpace;')
            }
        }

        set_current_element_active_class()

        // Clear out removed elements from raw text map
        const new_element_ids = all_child_elements.map((el) => el.getAttribute('id'))

        const removed_ids = all_element_ids.filter(id => !new_element_ids.includes(id))
        for (const id of removed_ids) {
            element_raw_texts.set(id, '&ZeroWidthSpace;')
        }

        all_element_ids = new_element_ids 
    }
}

async function on_content_element_focus_changed(old_element_id: string, new_element_id: string) {
    log('> current element change', 'EDITOR_LIFECYCLE')

    set_current_element_active_class()

    const old_element = document.getElementById(old_element_id)
    const new_element = document.getElementById(new_element_id)
    
    if (old_element) {
        const to_markdown: boolean = false
        await transform_editor_content(old_element, to_markdown)
    }
    
    if (new_element) {
        current_editing_element_id = new_element_id 
        const to_markdown: boolean = true
        await transform_editor_content(new_element, to_markdown)
    }

    compile_all_content()
}

async function on_content_key_down(event: KeyboardEvent) {
    log(`> on key down: ${event.key}`, 'EDITOR_LIFECYCLE')

    // Process the component listing command and early out if it's activated
    if (event.key === 'L' && event.shiftKey && (event.ctrlKey || event.metaKey)) {
        editor_state.value.showing_component_listing = !editor_state.value.showing_component_listing
        return
    }

    if (event.key === 'Tab') {
        event.preventDefault()
        if (!tabbed_preview_element_id) {
            tabbed_preview_element_id = current_editing_element_id
            on_content_element_focus_changed(current_editing_element_id, '')
        }
        return
    }

    let base_html = current_editing_element.value.innerHTML

    // Special case behavior: prevent deleting the element if it's empty and it's the only element on screen
    if (event.key === 'Backspace'
        && (base_html === '\u200B' || base_html === '<br>' || base_html === '' || base_html === '\n')
        && all_child_elements.length === 1) {
        current_editing_element.value.innerHTML = '\u200B'
        base_html = '\u200B'
    }
    
    let escaped_html = escape_html(base_html)

    if (event.key === 'Enter') {
        log('> on enter pressed', 'EDITOR_LIFECYCLE')

        event.preventDefault()

        // We are explicitly handling the enter key, so explicitly handle adding new lines
        const add_trailing_nl: boolean = base_html.charAt(base_html.length - 1) !== '\n'
        
        const caret = get_caret_position(current_editing_element.value)
        base_html = current_editing_element.value.innerText.slice(0, caret)
            + '\n'
            + current_editing_element.value.innerText.slice(caret)

        let new_caret = caret + 1

        if (add_trailing_nl) {
            base_html += '\n'
        }

        // Add a new item after a given number of new lines (maybe make this more configurable?)
        let new_el: any = null 
        if (base_html.includes("\n\n\n\n")) {
            log('> creatingnewelement', 'EDITOR_LIFECYCLE')

            const splits = base_html.split("\n\n\n\n")
            
            // Add new element id to id tracking list
            new_el = document.createElement("div")
            let new_el_id = generate_new_id()
            let current_el_index = all_child_elements.indexOf(current_editing_element.value)
            if (current_el_index >= 0) {
                if (current_el_index < all_child_elements.length - 1) {
                    all_element_ids.splice(current_el_index + 1, 0, new_el_id)
                } else {
                    all_element_ids.push(new_el_id)
                }
            }
            
            base_html = splits[0] || '&ZeroWidthSpace;'
            // Init for new element
            new_el.innerHTML = splits[1].trim() || '&ZeroWidthSpace;'
            // Make sure caret position follows correctly to new item
            new_caret = new_el.innerHTML.length

            element_raw_texts.set(new_el_id, escape_html(new_el.innerHTML))
            
            skip_selection_change = true
        }
        
        escaped_html = escape_html(base_html)
        current_editing_element.value.innerHTML = escaped_html
        
        // Insert the new element and update current element to point to it
        if (new_el) {
            current_editing_element.value.parentNode.insertBefore(new_el, current_editing_element.value.nextSibling)
            current_editing_element.value = new_el
        }
        
        set_caret_position(current_editing_element.value, new_caret)
    }
    
    element_raw_texts.set(current_editing_element_id, escaped_html)

    emit('contentmodified')
}

async function on_content_key_up(event: KeyboardEvent) {
    log(`> on key up: ${event.key}`, 'EDITOR_LIFECYCLE')

    if (event.key === 'Tab') {
        event.preventDefault()
        if (tabbed_preview_element_id) {
            on_content_element_focus_changed('', tabbed_preview_element_id)
            tabbed_preview_element_id = ''
        }
        return
    }

    if (event.key === 'Enter') {
        skip_selection_change = false
    }

    // Remove zero width space if necessary
    let base_html = current_editing_element.value.innerHTML
    let { new_html, removed } = manage_zero_width_space(base_html)
    base_html = new_html
    if (removed) {
        current_editing_element.value.innerHTML = base_html
        set_caret_position(current_editing_element.value, current_editing_element.value.textContent.length)
    }
}

async function on_content_selection_change(event: Event) {
    if (!event.target) {
        return
    }

    if (!editor_content.value.contains((event.target as Document).activeElement) || skip_selection_change || editor_state.value.showing_component_listing) {
        return
    }

    if (current_editing_element.value) {
        let caret_pos = get_caret_position(current_editing_element.value)
        log(`> selection change: caret at: ${caret_pos}`, 'EDITOR_LIFECYCLE')
    }

    let caret_node = get_caret_node()
    if (caret_node === editor_content.value) {
        caret_node = all_child_elements[0]
    }

    current_editing_element.value = get_direct_child_parent(editor_content.value, caret_node)
    current_caret_position = get_caret_position(current_editing_element.value)
}

async function on_content_hover(event: MouseEvent) {
    if (all_child_elements.includes(event.target)) {
        //
    }
}

watch(current_editing_element, async (new_editing_element: any, old_editing_element: any) => {
    const new_element_id = new_editing_element ? new_editing_element.getAttribute('id') : ''
    const old_element_id = old_editing_element ? old_editing_element.getAttribute('id') : ''
    if (new_element_id != old_element_id) {
        log(`${new_element_id} <- ${old_element_id}`, 'EDITOR_LIFECYCLE')
        await on_content_element_focus_changed(old_element_id, new_element_id)
    }
})

watch(editor_state, async (new_editor_state: any, _: any) => {
    if (editor_content.value) {
        editor_content.value.setAttribute('contenteditable', new_editor_state.is_in_edit_mode)
        if (new_editor_state.is_in_edit_mode && document.activeElement !== editor_content.value) {
            editor_content.value.focus()
        }

        if (new_editor_state.stylesheet_string) {
            if (!current_stylesheet) {
                current_stylesheet = new CSSStyleSheet()
                document.adoptedStyleSheets = [...document.adoptedStyleSheets, current_stylesheet]
            }
            current_stylesheet.replace(new_editor_state.stylesheet_string)
        }
    }
}, { deep: true })

onMounted(async () => {
    mutation_observer.observe(editor_content.value, { childList: true, subtree: true })
    document.addEventListener('selectionchange', on_content_selection_change)
    document.addEventListener('mouseover', on_content_hover)
    await initialize_editor_content()
})

onUnmounted(() => {
    mutation_observer.disconnect()
    document.removeEventListener('mouseover', on_content_hover)
    document.removeEventListener('selectionchange', on_content_selection_change)
})

onUpdated(() => {
    log('> on updated', 'EDITOR_LIFECYCLE')

    replace_editable_with_compiled()

    update_all_pre_elements()

    if (editor_content.value) {
        let all_link_elements = editor_content.value?.getElementsByTagName('a')
        for (const link_el of all_link_elements) {
            link_el.setAttribute('target', '_blank')
        }
    }
})

defineExpose({ export_document_string, import_document_string })
</script>

<template>
    <div class="editor-content-container">
        <div class="editor-content" ref="editor_content"
            @keydown="on_content_key_down" @keyup="on_content_key_up"
            @touchstart="$emit('on_editor_touch_start', $event)" @touchmove="$emit('on_editor_touch_move', $event)"
            @touchend="$emit('on_editor_touch_end', $event)" contenteditable="false" spellcheck="false" placeholder="Start typing">
        </div>
        <div class="editor-content" ref="compiled_editor_content" style="display: none;">
            <component :is="compiled_content"></component>
        </div>
        <div class="overlay-items"></div>
    </div>
</template>

<style scoped>
[contenteditable] {
    -webkit-tap-highlight-color: transparent;
}

.editor-content-container {
    position: relative;
    -ms-overflow-style: none;
    scrollbar-width: none;
    background: transparent;
}

.editor-content {
    position: relative;
    padding-top: 15px;
    padding-bottom: 25px;
    margin-bottom: 1px;
    border-style: solid;
    border-width: 0px 0px 1px 0px;
    border-color: var(--color-border);
    transition: 0.3s all;
    outline: none;
    white-space: pre-wrap;
}

.editor-content :deep(.active.empty)::after {
    content: 'Start typing! Use CTRL+SHIFT+L for a components palette. Hold TAB to preview current block render.';
    color: #ffffff52;
}

.editor-content :deep(div) {
    position: relative;
    white-space: normal;
}

.editor-content :deep(div.active) {
    white-space: pre-wrap;
}

.editor-content :deep(div.active)::before {
    content: '';
    position: absolute;
    height: 100%;
    border: 1px solid var(--vt-c-sunset-theme-5);
    bottom: 0;
    left: -10px;
}

.editor-content :deep(h3),
.editor-content :deep(h2),
.editor-content :deep(h1) {
    position: relative;
}

.editor-content :deep(h3) {
    text-decoration: underline;
    text-decoration-color: var(--vt-c-sunset-theme-5);
    text-decoration-thickness: 2px;
    font-weight: bold;
    font-size: 14pt;
}

.editor-content :deep(h3.active)::before,
.editor-content :deep(h2.active)::before,
.editor-content :deep(h1.active)::before {
    content: '';
    position: absolute;
    height: 100%;
    border: 1px solid var(--vt-c-sunset-theme-5);
    bottom: 0;
    left: 0px;
}

.editor-content :deep(pre) {
    position: relative;
    padding: 10px;
    background-color: var(--vt-c-gray-mute);
    border-radius: 5px;
    margin-bottom: 10px;
    border-color: var(--vt-c-active-green);
    overflow-x: scroll;
    max-height: 650px;
}

.editor-content :deep(pre.active)::before {
    content: '';
    position: absolute;
    height: 100%;
    border: 1px solid var(--vt-c-sunset-theme-5);
    bottom: 0;
    left: 0px;
}

.editor-content :deep(img) {
    position: relative;
    margin: 0 auto;
    max-width: 100%;
    max-height: 465px;
    object-fit: scale-down;
    border-radius: 5px;
}

.editor-content :deep(strong) {
    font-weight: bold;
}

.editor-content :deep(p) {
    position: relative;
    white-space: normal;
}

.editor-content :deep(p.active) {
    white-space: pre-wrap;
}

.editor-content :deep(p.active)::before {
    content: '';
    position: absolute;
    height: 100%;
    border: 1px solid var(--vt-c-sunset-theme-5);
    bottom: 0;
    left: -10px;
}

.editor-content :deep(a) {
    text-decoration: none;
    color: var(--color-link)
}

.editor-content :deep(blockquote) {
    position: relative;
    background-color: var(--color-background-soft);
    border-left: 2px solid var(--vt-c-dark-green);
    padding-left: 10px;
    margin-bottom: 10px;
    margin-left: 5px;
}

.editor-content :deep(blockquote.active)::before {
    content: '';
    position: absolute;
    height: 100%;
    border: 1px solid var(--vt-c-sunset-theme-5);
    bottom: 0;
    left: -10px;
}

.editor-content :deep(blockquote) p {
    padding: 10px;
}

.editor-content :deep(ul) {
    padding-bottom: 10px;
    white-space: normal;
}

.editor-content :deep(ul.active) {
    padding-bottom: 10px;
    white-space: pre-wrap;
}

.editor-content :deep(code) {
    outline: none;
    white-space: pre;
}

.editor-content :deep(.code-line) {
    display: inline-block;
    width: 100%;
}

.hljs {
    background-color: transparent;
}

.editor-content :deep(.copy-button) {
    position: sticky;
    float: right;
    width: 35px;
    height: 35px;
    text-align: center;
    cursor: pointer;
    border-radius: 5px;
}

.editor-content :deep(.copy-button):hover {
    background-color: var(--vt-c-muted-green);
}

.editor-content :deep(.splitter) {
    width: 100%;
    height: 1px;
    position: relative;
    background: linear-gradient(90deg, #00000000 0%, #e8802d66, transparent 100%);
    margin: 35px 0px;
}

.editable-area {
    position: relative;
    display: block;
    width: 100%;
    min-height: 200px;
    overflow: hidden;
    overflow-y: scroll;
    border: none;
    color: var(--color-text);
    background-color: #08041c;
    z-index: 3;
    max-height: 550px;
    box-shadow: 0px 0px 0px 1px var(--vt-c-sunset-theme-5);
    border-radius: 5px;
}

.editable-area.description {
    height: 5%;
}

.editable-area:focus {
    outline: none;
}

.overlay-items {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
}

@media screen and (max-width: 612px) {
    .editor-content-container {
        padding: 25px !important;
    }

    .editor-content :deep(pre) {
        max-height: 250px;
        overflow-y: scroll;
    }
}
</style>