// @flow
import {type List, type Record} from 'immutable'

export type EditShippingAdddressState = Record<{
    loading: boolean,
    loadingMessage: ?string,
    addresses: List<Map<any, any>>,
}>
