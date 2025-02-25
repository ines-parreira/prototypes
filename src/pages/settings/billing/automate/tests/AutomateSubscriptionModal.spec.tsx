import React, { ComponentProps } from 'react'

import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import { UserRole } from 'config/types/user'
import { account, automationSubscriptionProductPrices } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { RootState } from 'state/types'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'
import { assumeMock } from 'utils/testing'

import AutomateSubscriptionModal from '../AutomateSubscriptionModal'

const defaultState: Partial<RootState> = {
    currentUser: fromJS({
        role: { name: UserRole.Admin },
    }),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            status: 'active',
        },
    }),
    billing: fromJS(billingState),
}

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

const minProps: ComponentProps<typeof AutomateSubscriptionModal> = {
    confirmLabel: 'I am sure',
    isOpen: false,
    onClose: jest.fn(),
}

describe('<AutomateSubscriptionModal />', () => {
    it('should not render the modal', () => {
        const { baseElement } = renderWithStoreAndQueryClientProvider(
            <AutomateSubscriptionModal {...minProps} />,
            defaultState,
        )
        expect(logEventMock).not.toHaveBeenCalled()
        expect(baseElement).toMatchSnapshot()
    })

    it('should render the modal', () => {
        const { baseElement } = renderWithStoreAndQueryClientProvider(
            <AutomateSubscriptionModal {...minProps} isOpen />,
            defaultState,
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            { location: undefined },
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should display loader', async () => {
        renderWithStoreAndQueryClientProvider(
            <>
                {' '}
                <AutomateSubscriptionModal {...minProps} isOpen />
            </>,
            defaultState,
        )
        const button = await screen.findByText(/I am sure/)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            { location: undefined },
        )
        fireEvent.click(button)
        expect(button).toMatchSnapshot()
    })

    it('should render for customers already with full add-on features', async () => {
        const { baseElement } = renderWithStoreAndQueryClientProvider(
            <AutomateSubscriptionModal {...minProps} isOpen />,
            {
                ...defaultState,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: automationSubscriptionProductPrices,
                    },
                }),
            },
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            { location: undefined },
        )
        await screen.findByText(/Cancel subscription/i)
        expect(baseElement).toMatchSnapshot()
    })

    it('should display image', async () => {
        renderWithStoreAndQueryClientProvider(
            <>
                {' '}
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    image="foo.png"
                />
            </>,
            defaultState,
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            { location: undefined },
        )
        const img = await screen.findByAltText(/features/)
        expect(img).toMatchSnapshot()
    })

    it('should display the new modal description component', () => {
        renderWithStoreAndQueryClientProvider(
            <AutomateSubscriptionModal {...minProps} isOpen />,
            defaultState,
        )

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            { location: undefined },
        )
        expect(
            screen.getByText(`Ready to upgrade with Automate?`),
        ).toBeInTheDocument()
    })
})
