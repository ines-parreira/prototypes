import {Map} from 'immutable'

import client from '../../models/api/resources'
import history from '../../pages/history'
import {onUpdateSuccess, fetchIntegration} from '../integrations/actions'
import * as types from '../integrations/constants'
import {StoreDispatch} from '../types'
import {Campaign} from '../../models/integration/types'

export function createCampaign(
    campaign: Map<any, any>,
    integration: Map<any, any>
) {
    return (dispatch: StoreDispatch) => {
        return client
            .post<Campaign>(
                `/api/integrations/${integration.get('type') as string}/${
                    integration.get('id') as string
                }/campaigns/`,
                campaign.toJS()
            )
            .then((json) => json?.data)
            .then(
                (data) => {
                    void onUpdateSuccess(
                        dispatch,
                        integration.toJS(),
                        null,
                        true
                    )
                    return dispatch(
                        fetchIntegration(
                            integration.get('id'),
                            integration.get('type')
                        )
                    ).then(() => {
                        history.push(
                            `/app/settings/integrations/${
                                integration.get('type') as string
                            }/${integration.get('id') as string}/campaigns/${
                                data.id
                            }`
                        )
                    })
                },
                (error) => {
                    return dispatch({
                        type: types.UPDATE_INTEGRATION_ERROR,
                        error,
                        verbose: true,
                    })
                }
            )
    }
}
export function updateCampaign(
    campaign: Map<any, any>,
    integration: Map<any, any>
) {
    return (dispatch: StoreDispatch) => {
        return client
            .put<Campaign>(
                `/api/integrations/${integration.get('type') as string}/${
                    integration.get('id') as string
                }/campaigns/${campaign.get('id') as string}`,
                campaign.toJS()
            )
            .then((json) => json?.data)
            .then(
                () => {
                    void onUpdateSuccess(
                        dispatch,
                        integration.toJS(),
                        null,
                        true
                    )
                    return dispatch(
                        fetchIntegration(
                            integration.get('id'),
                            integration.get('type')
                        )
                    )
                },
                (error) => {
                    return dispatch({
                        type: types.UPDATE_INTEGRATION_ERROR,
                        error,
                        verbose: true,
                    })
                }
            )
    }
}
export function deleteCampaign(
    campaign: Map<any, any>,
    integration: Map<any, any>
) {
    return (dispatch: StoreDispatch) => {
        return client
            .delete(
                `/api/integrations/${integration.get('type') as string}/${
                    integration.get('id') as string
                }/campaigns/${campaign.get('id') as string}`
            )
            .then(
                () => {
                    void onUpdateSuccess(
                        dispatch,
                        integration.toJS(),
                        null,
                        true
                    )
                    return dispatch(
                        fetchIntegration(
                            integration.get('id'),
                            integration.get('type')
                        )
                    )
                },
                (error) => {
                    return dispatch({
                        type: types.UPDATE_INTEGRATION_ERROR,
                        error,
                        reason: 'Failed to update integration',
                    })
                }
            )
    }
}
