import { isCancel } from 'axios'
import type { Map } from 'immutable'
import _debounce from 'lodash/debounce'

import GorgiasApi from '../../../../services/gorgiasApi'
import type { StoreDispatch } from '../../../types'
import { onApiError } from '../../../utils'
import { SET_ADDRESSES, SET_INITIAL_STATE, SET_LOADING } from './constants'

const _apiInstances: { [key: string]: GorgiasApi } = {}
const getApiInstance = (key: string) => () => {
    if (!_apiInstances[key]) {
        _apiInstances[key] = new GorgiasApi()
    }

    return _apiInstances[key]
}

const getCalculateApi = getApiInstance('calculate')

const setLoading = (loading: boolean, message: Maybe<string> = null) => ({
    type: SET_LOADING,
    loading,
    message,
})

const setAddresses = (addresses: Map<any, any>) => ({
    type: SET_ADDRESSES,
    addresses,
})

const setInitialState = () => ({
    type: SET_INITIAL_STATE,
})

export const onInit =
    (integrationId: number, customerId: string, onError: () => void) =>
    async (dispatch: StoreDispatch) => {
        try {
            const api = getCalculateApi()

            api.cancelPendingRequests(true)

            dispatch(setLoading(true, 'Fetching Shipping addresses ...'))

            const addresses = await api.getShippingAddressList(
                integrationId,
                customerId,
            )
            dispatch(setAddresses(addresses))
        } catch (error) {
            if (isCancel(error)) {
                return
            }
            onError && onError()
            dispatch(
                onApiError(
                    error,
                    'Error while feching edit addresses',
                    setLoading(false),
                ),
            )
        } finally {
            dispatch(setLoading(false))
        }
    }

/**
 * Reset the modal state between two modal openings after a small debounce
 */
export const onReset = () => (dispatch: StoreDispatch) => resetState(dispatch)

export const resetState = _debounce(
    (dispatch: StoreDispatch) => dispatch(setInitialState()),
    250,
)
