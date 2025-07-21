import axios from 'axios'

const commonHeaders = (axios.defaults.headers as Record<string, unknown>)
    .common as Record<string, unknown>
commonHeaders['X-CSRF-Token'] = 'abcd'
commonHeaders['X-Gorgias-User-Client'] = 'web'

export const handleNewRelease = jest.fn()

export const createClient = () => axios

export const initializeNewReleaseHandler = jest.fn()

export default axios
