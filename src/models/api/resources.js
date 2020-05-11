//@flow
import axios from 'axios'

import {deepMapKeysToCamelCase, deepMapKeysToSnakeCase} from './utils'

const client = axios.create()
client.interceptors.response.use((res) => ({
    ...res,
    data: deepMapKeysToCamelCase(res.data),
}))
client.interceptors.request.use((req) =>
    req.data ? {
        ...req,
        data: deepMapKeysToSnakeCase(req.data),
    } : req
)

export default client
