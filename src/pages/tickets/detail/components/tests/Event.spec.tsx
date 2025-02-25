import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'

import { INFOBAR_CUSTOM_BUTTON_ACTION_NAME } from 'config/actions'

import { EventContainer } from '../Event'

jest.mock('pages/common/utils/DatetimeLabel', () => () => (
    <div>MockedDatetimeLabel</div>
))

describe('Event component', () => {
    const rechargeIntegrationId = 2
    const rechargeCustomerHash = 'sd478fs57dfds4f1'
    const subscriptionId = 6
    const chargeId = 8

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
    }

    const getProps = (integrationId: number) => ({
        integrationData: fromJS(integrationsData[integrationId]),
        integration: fromJS(integrations[integrationId]),
    })

    const minProps: ComponentProps<typeof EventContainer> = {
        event: fromJS({}),
        isLast: false,
        appData: { __app_name__: 'foo' },
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
        const { container } = render(
            <EventContainer {...minProps} event={event} />,
        )
        expect(container).toMatchSnapshot()
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

        const { container } = render(
            <EventContainer {...minProps} event={event} />,
        )

        expect(container).toMatchSnapshot()
    })

    it('should fallback to email when user has no name', () => {
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
            user: {
                ...baseEventFixture.user,
                name: '',
            },
        })

        render(<EventContainer {...minProps} event={event} />)

        expect(screen.getByText(baseEventFixture.user.email))
    })
})
