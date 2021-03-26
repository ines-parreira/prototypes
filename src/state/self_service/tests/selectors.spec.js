import {
    getSelfServiceState,
    getSelfServiceConfigurations,
    getLoading,
} from '../selectors.ts'
import {selfServiceState} from '../../../fixtures/self_service_configurations.ts'

const state = {
    selfService: selfServiceState,
}

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
