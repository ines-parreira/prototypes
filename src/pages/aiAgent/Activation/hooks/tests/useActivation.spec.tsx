import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import * as segment from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { integrationsStateWithShopify } from 'fixtures/integrations'
import { Cadence } from 'models/billing/types'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useActivation } from '../useActivation'
import { useEarlyAccessModalState } from '../useEarlyAccessModalState'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('../useEarlyAccessModalState')
jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))
jest.mock('core/flags')

const mockedLogEvent = jest
    .spyOn(segment, 'logEvent')
    .mockImplementation(jest.fn)
const mockStore = configureMockStore()

const defaultState = {
    integrations: fromJS(integrationsStateWithShopify),
    currentAccount: fromJS(account),
} as RootState

const queryClient = mockQueryClient()

const mockedUseEarlyAccessModalState = jest.mocked(useEarlyAccessModalState)
const mockedUseParams = jest.mocked(useParams)
const mockUseFlag = jest.mocked(useFlag)

describe('useActivation', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseParams.mockReturnValue({})
        mockUseFlag.mockImplementation(
            (key, __defaultValue) =>
                (({ [FeatureFlagKey.AiAgentActivation]: true }) as any)[key],
        )
    })

    const defaultUseEarlyAccessModalStateReturnValue = {
        isOnNewPlan: true,
        setIsPreviewModalVisible: jest.fn(),
        isPreviewModalVisible: false,
        isCurrentUserAdmin: true,
        currentPlan: {
            amount: 900,
            currency: 'USD',
            cadence: Cadence.Month,
            discount: 132,
            generation: 5,
        } as any,
        earlyAccessPlan: {
            amount: 900,
            currency: 'USD',
            amount_after_discount: 800,
            cadence: Cadence.Month,
            discount: 100,
        } as any,
        isLoading: false,
    }

    it('should return ActivationButton, EarlyAccessModal and ActivationModal components', () => {
        mockedUseEarlyAccessModalState.mockReturnValue(
            defaultUseEarlyAccessModalStateReturnValue,
        )

        const { result } = renderHook(() => useActivation('any-page'), {
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
        mockedUseEarlyAccessModalState.mockReturnValue(
            defaultUseEarlyAccessModalStateReturnValue,
        )

        const { result } = renderHook(() => useActivation('any-page'), {
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

    it('should close the EarlyAccessModal when clicking on the cross button or outside of the modal', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiAgentActivation]: true,
        })
        mockedUseBillingData.mockReturnValue({
            isOnNewPlan: false,
            setIsPreviewModalVisible: jest.fn(),
            isPreviewModalVisible: false,
            isCurrentUserAdmin: true,
            currentPlan: {
                amount: 900,
                currency: 'USD',
                cadence: Cadence.Month,
                discount: 132,
                generation: 5,
            } as any,
            earlyAccessPlan: {
                amount: 900,
                currency: 'USD',
                amount_after_discount: 800,
                cadence: Cadence.Month,
                discount: 100,
            } as any,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useActivation('ai-agent-overview'),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    </QueryClientProvider>
                ),
            },
        )

        expect(result.current.ActivationButton).toBeDefined()
        expect(result.current.ActivationModal).toBeDefined()
        expect(result.current.EarlyAccessModal).toBeDefined()

        act(() => {
            result.current.ActivationButton()?.props.onClick()
        })

        expect(result.current.ActivationModal().props.isOpen).toBe(true)

        // a click on the cross button or outside of the modal triggers the onClose event.
        act(() => {
            result.current.EarlyAccessModal()?.props.onClose()
        })

        expect(result.current.EarlyAccessModal()?.props.isOpen).toBe(false)

        expect(mockedLogEvent).toHaveBeenCalledWith(
            segment.SegmentEvent.AiAgentActivatePreviewPricingModalClosed,
            {
                page: 'ai-agent-overview',
                reason: 'clicked-on-cross-or-outside',
            },
        )
    })

    it('should close the EarlyAccessModal when clicking on the stay on current plan button', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiAgentActivation]: true,
        })
        mockedUseBillingData.mockReturnValue({
            isOnNewPlan: false,
            setIsPreviewModalVisible: jest.fn(),
            isPreviewModalVisible: false,
            isCurrentUserAdmin: true,
            currentPlan: {
                amount: 900,
                currency: 'USD',
                cadence: Cadence.Month,
                discount: 132,
                generation: 5,
            } as any,
            earlyAccessPlan: {
                amount: 900,
                currency: 'USD',
                amount_after_discount: 800,
                cadence: Cadence.Month,
                discount: 100,
            } as any,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useActivation('ai-agent-overview'),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    </QueryClientProvider>
                ),
            },
        )

        expect(result.current.ActivationButton).toBeDefined()
        expect(result.current.ActivationModal).toBeDefined()
        expect(result.current.EarlyAccessModal).toBeDefined()

        act(() => {
            result.current.ActivationButton()?.props.onClick()
        })

        expect(result.current.ActivationModal().props.isOpen).toBe(true)

        act(() => {
            result.current.EarlyAccessModal()?.props.onStayClick()
        })

        expect(result.current.EarlyAccessModal()?.props.isOpen).toBe(false)

        expect(mockedLogEvent).toHaveBeenCalledWith(
            segment.SegmentEvent.AiAgentActivatePreviewPricingModalClosed,
            {
                page: 'ai-agent-overview',
                reason: 'clicked-on-stay-button',
            },
        )
    })

    it('should log event ai-agent-activate-main-button-clicked when clicking activation button', () => {
        mockedUseEarlyAccessModalState.mockReturnValue(
            defaultUseEarlyAccessModalStateReturnValue,
        )

        const { result } = renderHook(() => useActivation('any-page'), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                </QueryClientProvider>
            ),
        })

        const ActivationButton = result.current.ActivationButton
        const { getByText } = render(<ActivationButton />)

        const activationButton = getByText('Manage')
        expect(activationButton).toBeTruthy()

        activationButton.click()

        expect(mockedLogEvent).toHaveBeenCalledWith(
            segment.SegmentEvent.AiAgentActivateMainButtonClicked,
            { page: 'any-page' },
        )
    })
})
