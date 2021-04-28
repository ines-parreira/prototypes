import {CombinedState} from 'redux'

import {
    getSelfServiceState,
    getSelfServiceConfigurations,
    getLoading,
} from '../selectors'
import {selfServiceState} from '../../../fixtures/self_service_configurations'
import {StoreState} from '../../types'

const state = {
    selfService: selfServiceState,
} as CombinedState<StoreState>

describe('self-service selectors', () => {
    it('should get the self-service state', () => {
        const selfServiceState = getSelfServiceState(state)
        expect(selfServiceState).toEqual(state.selfService)
    })

    it('should get the self-service configurations', () => {
        const configurations = getSelfServiceConfigurations(state)
        const expected = getSelfServiceState(state).self_service_configurations
        expect(configurations).toEqual(expected)
    })

    it('should get loading', () => {
        const loading = getLoading(state)
        const expected = getSelfServiceState(state).loading
        expect(loading).toEqual(expected)
    })
})
