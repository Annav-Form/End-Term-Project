import axios from 'axios'

const api = axios.create(
    {
        baseURL: "https://codeforces.com/api"
    }
)

export default api