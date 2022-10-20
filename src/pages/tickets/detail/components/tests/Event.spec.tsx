import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'

import {INFOBAR_CUSTOM_BUTTON_ACTION_NAME} from 'config/actions'
import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'

import {EventContainer} from '../Event'

jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({
    [FeatureFlagKey.TicketMessagesVirtualization]: true,
})

describe('Event component', () => {
    const rechargeIntegrationId = 2
    const rechargeCustomerHash = 'sd478fs57dfds4f1'
    const subscriptionId = 6
    const chargeId = 8

    const shopifyIntegrationId = 1
    const orderId = 3
    const itemId = 5

    const baseEventFixture = {
        created_datetime: '2017-12-07T01:01:34.502206+00:00',
        isEvent: true,
        type: 'action-executed',
        user: {
            id: 1,
            firstname: 'Acme',
            lastname: 'Support',
            name: 'Acme Support',
            email: 'support@acme.gorgias.io',
        },
    }

    const integrationsData = {
        [shopifyIntegrationId.toString()]: {
            orders: [
                {
                    id: orderId,
                    name: '#1234',
                    line_items: [
                        {
                            id: itemId,
                            name: 'Beautiful butterfly',
                        },
                    ],
                },
            ],
        },
        [rechargeIntegrationId.toString()]: {
            customer: {
                hash: rechargeCustomerHash,
            },
            subscriptions: [
                {
                    id: subscriptionId,
                },
            ],
            charges: [
                {
                    id: chargeId,
                },
            ],
        },
    }

    const integrations = {
        [rechargeIntegrationId.toString()]: {
            id: rechargeIntegrationId,
            type: 'recharge',
            name: 'my-store',
            meta: {
                store_name: 'my-store',
            },
        },
        [shopifyIntegrationId.toString()]: {
            id: shopifyIntegrationId,
            type: 'shopify',
            name: 'my-store',
            meta: {
                shop_name: 'my-store',
            },
        },
    }

    const getProps = (integrationId: number) => ({
        integrationData: fromJS(integrationsData[integrationId]),
        integration: fromJS(integrations[integrationId]),
    })

    const minProps: ComponentProps<typeof EventContainer> = {
        event: fromJS({}),
        isLast: false,
        ...getProps(rechargeIntegrationId),
        dispatch: jest.fn(),
    }

    it('should display the correct label for an action', () => {
        const event: Map<any, any> = fromJS({
            ...baseEventFixture,
            data: {
                action_name: INFOBAR_CUSTOM_BUTTON_ACTION_NAME,
                action_label: 'You should see me in snaps',
                integration_id: rechargeIntegrationId,
                payload: {
                    subscription_id: subscriptionId,
                },
                status: 'success',
            },
        })
        const component = shallow(
            <EventContainer {...minProps} event={event} />
        )
        expect(component).toMatchSnapshot()
    })

    it('should display correctly a successful event for a Recharge Subscription action', () => {
        const event: Map<any, any> = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'rechargeCancelSubscription',
                integration_id: rechargeIntegrationId,
                payload: {
                    subscription_id: subscriptionId,
                },
                status: 'success',
            },
        })

        const component = shallow(
            <EventContainer {...minProps} event={event} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display correctly a failed event for a Recharge Subscription action', () => {
        const event: Map<any, any> = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'rechargeCancelSubscription',
                integration_id: rechargeIntegrationId,
                payload: {
                    subscription_id: subscriptionId,
                },
                status: 'error',
                msg: 'the error is real',
            },
        })

        const component = shallow(
            <EventContainer {...minProps} event={event} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display correctly a successful event for a Recharge Charge action', () => {
        const event: Map<any, any> = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'rechargeSkipCharge',
                integration_id: rechargeIntegrationId,
                payload: {
                    subscription_id: subscriptionId,
                    charge_id: chargeId,
                },
                status: 'success',
            },
        })

        const component = shallow(
            <EventContainer {...minProps} event={event} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display correctly a failed event for a Recharge Charge action', () => {
        const event: Map<any, any> = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'rechargeSkipCharge',
                integration_id: rechargeIntegrationId,
                payload: {
                    subscription_id: subscriptionId,
                    charge_id: chargeId,
                },
                status: 'error',
                msg: 'the error is real',
            },
        })

        const component = shallow(
            <EventContainer {...minProps} event={event} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display correctly a successful event for a Shopify Order action', () => {
        const event: Map<any, any> = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'shopifyFullRefundOrder',
                integration_id: shopifyIntegrationId,
                payload: {
                    order_id: orderId,
                },
                status: 'success',
            },
        })

        const component = shallow(
            <EventContainer
                {...minProps}
                {...getProps(shopifyIntegrationId)}
                event={event}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display correctly a successful event for a Shopify Order action with custom payload', () => {
        const event: Map<any, any> = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'shopifyCancelOrder',
                integration_id: shopifyIntegrationId,
                payload: {
                    order_id: orderId,
                    payload: {foo: 'bar'},
                },
                status: 'success',
            },
        })

        const component = shallow(
            <EventContainer
                {...minProps}
                {...getProps(shopifyIntegrationId)}
                event={event}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display correctly a failed event for a Shopify Order action', () => {
        const event: Map<any, any> = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'shopifyFullRefundOrder',
                integration_id: shopifyIntegrationId,
                payload: {
                    order_id: orderId,
                },
                status: 'error',
                msg: 'the error is real',
            },
        })

        const component = shallow(
            <EventContainer
                {...minProps}
                {...getProps(shopifyIntegrationId)}
                event={event}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should fallback to email when user has no name', () => {
        const event: Map<any, any> = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'shopifyFullRefundOrder',
                integration_id: shopifyIntegrationId,
                payload: {
                    order_id: orderId,
                },
                status: 'error',
                msg: 'the error is real',
            },
            user: {
                ...baseEventFixture.user,
                name: '',
            },
        })

        const component = shallow(
            <EventContainer
                {...minProps}
                {...getProps(shopifyIntegrationId)}
                event={event}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
