import { ref }  from 'vue'

const editor_state = ref({
    is_in_dev: false,
    is_in_edit_mode: false,
    has_mac_support: false,
    showing_component_listing: false,
    asset_endpoint: '',
    stylesheet_string: ''
})

export function get_editor_state()
{
    return { editor_state }
}

export function start_editing()
{
    editor_state.value.is_in_edit_mode = true
}

export function stop_editing()
{
    editor_state.value.is_in_edit_mode = false
}