// @flow
import type {stateType} from '../types'


export const getApiKey = (state: stateType): string => {
    const apiKey = state.auths.find((auth) => auth.get('type') === 'api_key')
    return apiKey ? apiKey.getIn(['data', 'token']) : ''
}
