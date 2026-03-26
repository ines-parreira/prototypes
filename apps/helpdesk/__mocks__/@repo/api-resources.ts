import axios from 'axios'

export const handleNewRelease = jest.fn()

export const createClient = () => axios

export const initializeNewReleaseHandler = jest.fn()

export const gorgiasAppsAuthInterceptor = jest.fn((config) => config)

export default axios
