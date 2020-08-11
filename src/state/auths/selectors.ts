import {Map} from 'immutable'

import {RootState} from '../types'

export const getApiKey = (state: RootState): string => {
    const apiKey: Maybe<Map<any, any>> = state.auths.find(
        (auth: Map<any, any>) => auth.get('type') === 'api_key'
    )
    return apiKey ? (apiKey.getIn(['data', 'token']) as string) : ''
}
