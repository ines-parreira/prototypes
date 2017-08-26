import {fromJS} from 'immutable'
import {integrationsState} from '../../../fixtures/integrations'
import {getIntegrationsState, getEmailIntegrations} from '../selectors'
import reducers from '../reducers'
import * as types from '../constants'

const state = {
    integrations: fromJS(integrationsState),
}

describe('integrations selectors', () => {
    it('should handle DELETE_INTEGRATION_SUCCESS', () => {
        const action = {
            type: types.DELETE_INTEGRATION_SUCCESS,
            id: getEmailIntegrations(state).getIn([0, 'id'])
        }
        const newState = reducers(state.integrations, action)
        const expected = getIntegrationsState(state).update('integrations', integrations => (
            integrations.valueSeq().filter(int => int.get('id') !== action.id).toList()
        )).setIn(['state', 'loading', 'delete'], false)

        expect(newState).toEqual(expected)
    })

    it('should handle DELETE_INTEGRATION_ERROR', () => {
        const newState = reducers(state.integrations, {type: types.DELETE_INTEGRATION_ERROR})
        const expected = getIntegrationsState(state).setIn(['state', 'loading', 'delete'], false)
        expect(newState).toEqual(expected)
    })
})
