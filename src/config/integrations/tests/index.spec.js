//@flow
import {
    INTEGRATION_HIDDEN_VARIABLES,
    INTEGRATION_PREVIOUS_VARIABLES,
    INTEGRATION_TYPE_WITH_VARIABLES,
    INTEGRATION_VARIABLES,
} from '../index'

describe('config', () => {
    describe('integrations', () => {
        describe('INTEGRATION_VARIABLES', () => {
            it('should contain all variables of all integrations with variables', () => {
                expect(INTEGRATION_VARIABLES).toMatchSnapshot()
            })
        })

        describe('INTEGRATION_HIDDEN_VARIABLES', () => {
            it('should contain all hidden variables of all integrations with hidden variables', () => {
                expect(INTEGRATION_HIDDEN_VARIABLES).toMatchSnapshot()
            })
        })

        describe('INTEGRATION_PREVIOUS_VARIABLES', () => {
            it('should contain all previous variables of all integrations with previous variables', () => {
                expect(INTEGRATION_PREVIOUS_VARIABLES).toMatchSnapshot()
            })
        })

        describe('INTEGRATION_TYPE_WITH_VARIABLES', () => {
            it('should contain integration types of all integrations with any kind of variables', () => {
                expect(INTEGRATION_TYPE_WITH_VARIABLES).toMatchSnapshot()
            })
        })
    })
})
