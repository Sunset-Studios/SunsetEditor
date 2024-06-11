export function wait_for_all_img_loads(element: any, cb: () => {})
{
    if (element)
    {
        let all_img_elements = element.getElementsByTagName('img')
        for (const img_el of all_img_elements)
        {
            img_el.onload = cb;
        }
    }
}

export function escape_html(html: string) {
    return html
        .replace(/&(?:amp;)*/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

export function unescape_html(html: string) {
    return html 
        .replace(/&(?:amp;)+/g, '&')
        .replace(/&(?:lt;)+/g, '<')
        .replace(/&(?:gt;)+/g, '>')
        .replace(/&(?:quot;)+/g, '"')
        .replace(/&(?:#039;)+/g, "'")
}