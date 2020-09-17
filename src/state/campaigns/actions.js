import axios from 'axios'
import {browserHistory} from 'react-router'

import {onUpdateSuccess, fetchIntegration} from '../integrations/actions.ts'
import * as types from '../integrations/constants'

export function createCampaign(campaign, integration) {
    return (dispatch) => {
        return axios
            .post(
                `/api/integrations/${integration.get('type')}/${integration.get(
                    'id'
                )}/campaigns/`,
                campaign.toJS()
            )
            .then((json = {}) => json.data)
            .then(
                (data) => {
                    onUpdateSuccess(dispatch, integration.toJS(), null, true)
                    return dispatch(
                        fetchIntegration(
                            integration.get('id'),
                            integration.get('type')
                        )
                    ).then(() => {
                        browserHistory.push(
                            `/app/settings/integrations/${integration.get(
                                'type'
                            )}/${integration.get('id')}/campaigns/${data.id}`
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

export function updateCampaign(campaign, integration) {
    return (dispatch) => {
        return axios
            .put(
                `/api/integrations/${integration.get('type')}/${integration.get(
                    'id'
                )}/campaigns/${campaign.get('id')}`,
                campaign.toJS()
            )
            .then((json = {}) => json.data)
            .then(
                () => {
                    onUpdateSuccess(dispatch, integration.toJS(), null, true)
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

export function deleteCampaign(campaign, integration) {
    return (dispatch) => {
        return axios
            .delete(
                `/api/integrations/${integration.get('type')}/${integration.get(
                    'id'
                )}/campaigns/${campaign.get('id')}`
            )
            .then((json = {}) => json.data)
            .then(
                () => {
                    onUpdateSuccess(dispatch, integration.toJS(), null, true)
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
