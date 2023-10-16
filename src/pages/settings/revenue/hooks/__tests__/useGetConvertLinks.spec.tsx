import React from 'react'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'
import {getStateWithPrice} from 'utils/paywallTesting'
import useGetConvertLinks from 'pages/settings/revenue/hooks/useGetConvertLinks'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {ADMIN_ROLE} from 'config/user'
import {starterHelpdeskPrice} from 'fixtures/productPrices'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'

jest.mock(
    'pages/settings/new_billing/components/ConvertSubscriptionModal',
    () => {
        return jest.fn(() => {
            return <div data-testid="mock-convert-subscription-modal" />
        })
    }
)

describe('useGetConvertLinks', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const defaultState = getStateWithPrice()

    const renderHookWithState = (state: Partial<RootState> = defaultState) =>
        renderHook(() => useGetConvertLinks(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

    describe('is Convert subscriber', () => {
        beforeEach(() => {
            jest.spyOn(
                isConvertSubscriberHook,
                'useIsConvertSubscriber'
            ).mockImplementation(() => true)
        })

        it('should render regular link', () => {
            const {result} = renderHookWithState()

            expect(result.current.length).toBe(1)

            const clickTrackingLink = result.current[0]
            expect(clickTrackingLink.requiredRole).toBe(ADMIN_ROLE)
            expect(clickTrackingLink.to).toBe('revenue/click-tracking')
            expect(clickTrackingLink.text).toBe('Click Tracking')
            expect(clickTrackingLink.extra).toBeFalsy()
            expect(clickTrackingLink.outerExtra).toBeFalsy()
        })
    })

    describe('is not Convert subscriber', () => {
        beforeEach(() => {
            jest.spyOn(
                isConvertSubscriberHook,
                'useIsConvertSubscriber'
            ).mockImplementation(() => false)
        })

        it('should render upgrade icon for starter plan', () => {
            const state = getStateWithPrice(starterHelpdeskPrice)
            const {result} = renderHookWithState(state)

            expect(result.current.length).toBe(1)

            const clickTrackingLink = result.current[0]
            expect(React.isValidElement(clickTrackingLink.extra)).toBe(true)
            expect((clickTrackingLink.extra as JSX.Element)?.type).toBe(
                UpgradeIcon
            )
            expect(clickTrackingLink.outerExtra).toBeFalsy()
        })

        it('should render upgrade icon and popover with modal for higher plan', () => {
            const {result} = renderHookWithState()

            expect(result.current.length).toBe(1)

            const clickTrackingLink = result.current[0]

            expect(React.isValidElement(clickTrackingLink.extra)).toBe(true)
            expect((clickTrackingLink.extra as JSX.Element)?.type).toBe(
                UpgradeIcon
            )

            expect(React.isValidElement(clickTrackingLink.outerExtra)).toBe(
                true
            )
            expect(clickTrackingLink.outerExtra).toMatchSnapshot()
        })
    })
})
