const allowed_categories: any = { 'EDITOR_LIFECYCLE': true, 'HTML_LIFECYCLE': false } 

export function log(message: string, category: string) {
    if (allowed_categories[category]) {
        console.log(message)
    }
}