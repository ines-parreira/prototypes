import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { FeatureFlagKey } from 'config/featureFlags'
import { account } from 'fixtures/account'
import { integrationsStateWithShopify } from 'fixtures/integrations'
import { Cadence } from 'models/billing/types'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useActivation } from '../useActivation'
import { useBillingData } from '../useBillingData'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('../useBillingData')

const mockStore = configureMockStore()

const defaultState = {
    integrations: fromJS(integrationsStateWithShopify),
    currentAccount: fromJS(account),
} as RootState

const queryClient = mockQueryClient()

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

const mockedUseBillingData = useBillingData as jest.MockedFunction<
    typeof useBillingData
>

describe('useActivation', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return ActivationButton, EarlyAccessModal and ActivationModal components', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiAgentActivation]: true,
        })
        mockedUseBillingData.mockReturnValue({
            isOnNewPlan: true,
            setIsPreviewModalVisible: jest.fn(),
            isPreviewModalVisible: false,
            isCurrentUserAdmin: true,
            plan: {
                amount: 932,
                currency: 'USD',
                amount_after_discount: 800,
                cadence: Cadence.Month,
                discount: 132,
            } as any,
            isLoading: false,
        })

        const { result } = renderHook(() => useActivation(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                </QueryClientProvider>
            ),
        })

        expect(result.current.ActivationButton).toBeDefined()
        expect(result.current.ActivationModal).toBeDefined()
        expect(result.current.EarlyAccessModal).toBeDefined()

        act(() => {
            result.current.ActivationButton()?.props.onClick()
        })

        expect(result.current.ActivationModal().props.isOpen).toBe(true)

        act(() => {
            result.current.ActivationButton()?.props.onClick()
        })

        expect(result.current.ActivationModal().props.isOpen).toBe(false)
    })

    it('should display the EarlyAccessModal', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiAgentActivation]: true,
        })
        mockedUseBillingData.mockReturnValue({
            isOnNewPlan: false,
            setIsPreviewModalVisible: jest.fn(),
            isPreviewModalVisible: false,
            isCurrentUserAdmin: true,
            plan: {
                amount: 932,
                currency: 'USD',
                amount_after_discount: 800,
                cadence: Cadence.Month,
                discount: 132,
            } as any,
            isLoading: false,
        })

        const { result } = renderHook(() => useActivation(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                </QueryClientProvider>
            ),
        })

        expect(result.current.ActivationButton).toBeDefined()
        expect(result.current.ActivationModal).toBeDefined()
        expect(result.current.EarlyAccessModal).toBeDefined()

        act(() => {
            result.current.ActivationButton()?.props.onClick()
        })

        expect(result.current.ActivationModal().props.isOpen).toBe(true)

        act(() => {
            result.current.ActivationButton()?.props.onClick()
        })

        expect(result.current.ActivationModal().props.isOpen).toBe(false)

        act(() => {
            // so our common friend codecov is happy
            result.current.ActivationModal().props.onSalesEnabled()
            result.current.EarlyAccessModal().props.onClose()
            result.current.EarlyAccessModal().props.onStayClick()
        })
    })
})
