import type {Map} from 'immutable'
import axios from 'axios'

import _debounce from 'lodash/debounce'

import {StoreDispatch} from '../../../types'
import GorgiasApi from '../../../../services/gorgiasApi'

import {onApiError} from '../editOrder/action'

import {SET_LOADING, SET_ADDRESSES, SET_INITIAL_STATE} from './constants'

const _apiInstances: {[key: string]: GorgiasApi} = {}
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

export const onInit = (
    integrationId: number,
    customerId: string,
    onError: () => void
) => async (dispatch: StoreDispatch) => {
    try {
        const api = getCalculateApi()

        api.cancelPendingRequests(true)

        dispatch(setLoading(true, 'Fetching Shipping addresses ...'))

        const addresses = await api.getShippingAddressList(
            integrationId,
            customerId
        )
        dispatch(setAddresses(addresses))
    } catch (error) {
        if (axios.isCancel(error)) {
            return
        }
        onError && onError()
        dispatch(onApiError(error, 'Error while feching edit addresses'))
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
    250
)
