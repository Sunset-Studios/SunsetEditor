import axios from 'axios'

export async function get_google_results_for_query(query: string) {
    const google_engine_url = `https://customsearch.googleapis.com/customsearch/v1?key=AIzaSyC-r7xRAFDI6RvVJARXx0gyTnruJD5P5Xs&cx=a4ce2ccca40cd41ee&q=${encodeURI(query)}`
    let response = await axios.get(google_engine_url)
    if (response && response.data && response.data.items) {
        return response.data.items
    }
    return []
}