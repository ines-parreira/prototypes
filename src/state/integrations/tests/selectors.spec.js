import {getIntegrationsState, getIntegrations, getEmailIntegrations, getChannels} from '../selectors'
import state from './fixtures'
import expect from 'expect'
import {fromJS} from 'immutable'

describe('selectors', () => {
    describe('integrations', () => {
        it('should get integrations state', () => {
            const integrations = getIntegrationsState(state)
            expect(integrations.equals(state.integrations)).toEqual(true)
        })

        it('should get integrations', () => {
            const integrations = getIntegrations(state)
            const expected = getIntegrationsState(state).get('integrations')

            expect(integrations.equals(expected)).toEqual(true)
        })

        it('should get email integrations', () => {
            const integrations = getEmailIntegrations(state)
            const expected = getIntegrations(state).filter(inte => ['email', 'gmail'].includes(inte.get('type', '')))

            expect(integrations.equals(expected)).toEqual(true)
        })

        it('should get channels', () => {
            const channels = getChannels(state)
            const expected = getEmailIntegrations(state).map(inte => {
                let type = inte.get('type')

                if (inte.get('type') === 'gmail') {
                    type = 'email'
                }

                return fromJS({
                    id: inte.get('id'),
                    type,
                    name: inte.get('name'),
                    address: inte.getIn(['meta', 'address']),
                    preferred: inte.getIn(['meta', 'preferred']),
                })
            })
            expect(channels.equals(expected)).toEqual(true)
        })
    })
})
