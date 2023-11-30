import {fromJS} from 'immutable'

import {SHOPIFY_INTEGRATION_TYPE} from 'constants/integration'

import replaceIntegrationVariables from '../replaceIntegrationVariables'

jest.mock('../getVariableWithValue', () => {
    return (variable: string) => {
        if (variable.includes('variableWithReplace')) {
            return 'my value'
        }

        return null
    }
})

describe('replaceIntegrationVariables()', () => {
    it('should return an empty value and log a notification because there is no matching integration', () => {
        const ticketState = fromJS({
            customer: {
                integrations: {
                    15: {
                        __integration_type__: 'weirdtype',
                        customer: {
                            foo: 'bar',
                        },
                    },
                },
            },
        })

        const notifySpy = jest.fn()

        const variable = 'ticket.customer.integrations.shopify.customer.foo'
        const newArg =
            'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
            'what is your {{ticket.customer.integrations.shopify.customer.foo}}?'

        const res = replaceIntegrationVariables(
            SHOPIFY_INTEGRATION_TYPE,
            ticketState,
            variable,
            newArg,
            fromJS({}),
            notifySpy
        )

        expect(res).toEqual(
            'Hello {{ticket.customer.integration.shopify.customer.name}}, what is your {{}}?'
        )
        expect(notifySpy.mock.calls).toMatchSnapshot()
    })

    it('should update the Shopify variable with the correct integration id', () => {
        const ticketState = fromJS({
            customer: {
                integrations: {
                    15: {
                        __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                        customer: {
                            foo: 'bar',
                        },
                    },
                },
            },
        })

        const notifySpy = jest.fn()

        const variable = 'ticket.customer.integrations.shopify.customer.foo'
        const newArg =
            'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
            'what is your {{ticket.customer.integrations.shopify.customer.foo}}?'

        const res = replaceIntegrationVariables(
            SHOPIFY_INTEGRATION_TYPE,
            ticketState,
            variable,
            newArg,
            fromJS({}),
            notifySpy
        )

        expect(res).toEqual(
            'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
                'what is your {{ticket.customer.integrations[15].customer.foo}}?'
        )
        expect(notifySpy).not.toHaveBeenCalled()
    })

    it('should update the variable with the correct value using the replace function in the config of the variable', () => {
        const ticketState = fromJS({
            customer: {
                integrations: {
                    15: {
                        __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                        customer: {
                            foo: 'bar',
                        },
                    },
                },
            },
        })

        const notifySpy = jest.fn()

        const variable =
            '{{ticket.customer.integrations.shopify.customer.variableWithReplace}}'
        const newArg =
            'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
            'what is your {{ticket.customer.integrations.shopify.customer.variableWithReplace}}?'

        const res = replaceIntegrationVariables(
            SHOPIFY_INTEGRATION_TYPE,
            ticketState,
            variable,
            newArg,
            fromJS({}),
            notifySpy
        )

        expect(res).toEqual(
            'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
                'what is your my value?'
        )
        expect(notifySpy).not.toHaveBeenCalled()
    })

    it('should take data from first of multiple Shopify integrations', () => {
        const ticketState = fromJS({
            customer: {
                integrations: {
                    15: {
                        __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                        customer: {
                            foo: 'bar',
                        },
                    },
                    17: {
                        __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                        customer: {
                            foo: 'bar',
                        },
                    },
                },
            },
        })

        const notifySpy = jest.fn()

        const variable = 'ticket.customer.integrations.shopify.customer.foo'
        const newArg =
            'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
            'what is your {{ticket.customer.integrations.shopify.customer.foo}}?'

        const res = replaceIntegrationVariables(
            SHOPIFY_INTEGRATION_TYPE,
            ticketState,
            variable,
            newArg,
            fromJS({}),
            notifySpy
        )

        expect(res).toEqual(
            'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
                'what is your {{ticket.customer.integrations[15].customer.foo}}?'
        )
        expect(notifySpy).not.toHaveBeenCalled()
    })

    it('should take data from most recent of multiple Shopify integrations updates based on updated_at info', () => {
        const ticketState = fromJS({
            customer: {
                integrations: {
                    15: {
                        __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                        customer: {
                            foo: 'bar',
                            updated_at: '2017-06-17T13:57:14-04:00',
                        },
                    },
                    16: {
                        __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                        customer: {
                            foo: 'bar',
                            updated_at: '2017-06-19T13:57:14-04:00',
                        },
                    },
                    17: {
                        __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                        customer: {
                            foo: 'bar',
                            updated_at: '2017-06-18T13:57:14-04:00',
                        },
                    },
                },
            },
        })

        const notifySpy = jest.fn()

        const variable = 'ticket.customer.integrations.shopify.customer.foo'
        const newArg =
            'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
            'what is your {{ticket.customer.integrations.shopify.customer.foo}}?'

        const res = replaceIntegrationVariables(
            SHOPIFY_INTEGRATION_TYPE,
            ticketState,
            variable,
            newArg,
            fromJS({}),
            notifySpy
        )

        expect(res).toEqual(
            'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
                'what is your {{ticket.customer.integrations[16].customer.foo}}?'
        )
        expect(notifySpy).not.toHaveBeenCalled()
    })

    it('should work with filters', () => {
        const ticketState = fromJS({
            customer: {
                integrations: {
                    15: {
                        __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                        customer: {
                            foo: 'bar',
                        },
                    },
                },
            },
        })

        const notifySpy = jest.fn()

        const variable = 'ticket.customer.integrations.shopify.customer.foo'
        const newArg =
            '{{ticket.customer.integrations.shopify.customer.foo|datetime_format("MM")}}'

        const res = replaceIntegrationVariables(
            SHOPIFY_INTEGRATION_TYPE,
            ticketState,
            variable,
            newArg,
            fromJS({}),
            notifySpy
        )

        expect(res).toEqual(
            '{{ticket.customer.integrations[15].customer.foo|datetime_format("MM")}}'
        )
        expect(notifySpy).not.toHaveBeenCalled()
    })
})
