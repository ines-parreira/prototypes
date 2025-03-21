import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import * as segment from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { integrationsStateWithShopify } from 'fixtures/integrations'
import { Cadence } from 'models/billing/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { useActivation } from '../useActivation'
import { useEarlyAccessModalState } from '../useEarlyAccessModalState'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('../useEarlyAccessModalState')
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
const mockUseFlag = jest.mocked(useFlag)

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
const useStoreActivationsMock = assumeMock(useStoreActivations)

const buildWrapper =
    (location: string = '/') =>
    ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={[location]}>
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            </QueryClientProvider>
        </MemoryRouter>
    )

describe('useActivation', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useStoreActivationsMock.mockReturnValue({
            score: 0,
        } as any)
        mockUseFlag.mockImplementation(
            (key, __defaultValue) =>
                (({ [FeatureFlagKey.AiAgentActivation]: true }) as any)[key],
        )
    })

    const defaultUseEarlyAccessModalStateReturnValue: ReturnType<
        typeof useEarlyAccessModalState
    > = {
        isOnNewPlan: true,
        setIsPreviewModalVisible: jest.fn(),
        isPreviewModalVisible: false,
        isCurrentUserAdmin: true,
        earlyAccessPlan: {
            amount: 900,
            currency: 'USD',
            amount_after_discount: 720,
            cadence: Cadence.Month,
            discount: 180,
            extra_ticket_cost: 1.2,
            num_quota_tickets: 450,
        } as any,
        currentPlan: {
            amount: 900,
            currency: 'USD',
            cadence: Cadence.Month,
            num_quota_tickets: 450,
            extra_ticket_cost: 2,
        } as any,
        isLoading: false,
        handleSubscriptionUpdate: jest.fn(),
        isSubscriptionUpdating: false,
    }

    it('should return ActivationButton, EarlyAccessModal and ActivationModal components', () => {
        mockedUseEarlyAccessModalState.mockReturnValue(
            defaultUseEarlyAccessModalStateReturnValue,
        )

        const { result } = renderHook(() => useActivation('any-page'), {
            wrapper: buildWrapper(),
        })

        expect(result.current.ActivationButton).toBeDefined()
        expect(result.current.ActivationModal).toBeDefined()
        expect(result.current.EarlyAccessModal).toBeDefined()

        act(() => {
            result.current.ActivationButton()?.props.onClick()
        })

        expect(result.current.ActivationModal().props.isOpen).toBe(true)

        act(() => {
            result.current.ActivationModal()?.props.onClose()
        })

        expect(result.current.ActivationModal().props.isOpen).toBe(false)
    })

    it('should display the EarlyAccessModal', () => {
        mockedUseEarlyAccessModalState.mockReturnValue(
            defaultUseEarlyAccessModalStateReturnValue,
        )

        const { result } = renderHook(() => useActivation('any-page'), {
            wrapper: buildWrapper(),
        })

        expect(result.current.ActivationButton).toBeDefined()
        expect(result.current.ActivationModal).toBeDefined()
        expect(result.current.EarlyAccessModal).toBeDefined()

        act(() => {
            result.current.ActivationButton()?.props.onClick()
        })

        expect(result.current.ActivationModal().props.isOpen).toBe(true)

        act(() => {
            result.current.ActivationModal()?.props.onClose()
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
        mockedUseEarlyAccessModalState.mockReturnValue(
            defaultUseEarlyAccessModalStateReturnValue,
        )

        const { result } = renderHook(() => useActivation('overview'), {
            wrapper: buildWrapper(),
        })

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
                page: 'overview',
                reason: 'clicked-on-cross-or-outside',
            },
        )
    })

    it('should close the EarlyAccessModal when clicking on the stay on current plan button', () => {
        mockedUseEarlyAccessModalState.mockReturnValue(
            defaultUseEarlyAccessModalStateReturnValue,
        )

        const { result } = renderHook(() => useActivation('overview'), {
            wrapper: buildWrapper(),
        })

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
                page: 'overview',
                reason: 'clicked-on-stay-button',
            },
        )
    })

    it('should close the ActivationModal when clicking on the Cancel button or clicking outside of the modal and log event ai-agent-activate-close-activation-modal', () => {
        mockedUseEarlyAccessModalState.mockReturnValue(
            defaultUseEarlyAccessModalStateReturnValue,
        )

        const { result } = renderHook(
            () => useActivation('ai-agent-overview'),
            { wrapper: buildWrapper() },
        )

        expect(result.current.ActivationButton).toBeDefined()
        expect(result.current.ActivationModal).toBeDefined()
        expect(result.current.EarlyAccessModal).toBeDefined()

        act(() => {
            result.current.ActivationButton()?.props.onClick()
        })

        expect(result.current.ActivationModal().props.isOpen).toBe(true)

        act(() => {
            result.current.ActivationModal()?.props.onClose()
        })

        expect(result.current.ActivationModal()?.props.isOpen).toBe(false)

        expect(mockedLogEvent).toHaveBeenCalledWith(
            segment.SegmentEvent.AiAgentActivateCloseActivationModal,
            {
                page: 'ai-agent-overview',
                reason: 'clicked-on-cancel-or-clicked-outside',
            },
        )
    })

    it('should log event ai-agent-activate-main-button-clicked when clicking activation button', () => {
        mockedUseEarlyAccessModalState.mockReturnValue(
            defaultUseEarlyAccessModalStateReturnValue,
        )

        const { result } = renderHook(() => useActivation('any-page'), {
            wrapper: buildWrapper(),
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

    it('should log event ai-agent-activate-early-access-modal-viewed when the early access modal is displayed', () => {
        mockedUseEarlyAccessModalState.mockReturnValue({
            isOnNewPlan: true,
            setIsPreviewModalVisible: jest.fn(),
            isPreviewModalVisible: true,
            isCurrentUserAdmin: true,
            earlyAccessPlan: {
                amount: 900,
                currency: 'USD',
                amount_after_discount: 720,
                cadence: Cadence.Month,
                discount: 180,
                extra_ticket_cost: 1.2,
                num_quota_tickets: 450,
            } as any,
            currentPlan: {
                amount: 900,
                currency: 'USD',
                cadence: Cadence.Month,
                num_quota_tickets: 450,
                extra_ticket_cost: 2,
            } as any,
            isLoading: false,
            handleSubscriptionUpdate: jest.fn(),
            isSubscriptionUpdating: false,
        })

        const { result } = renderHook(() => useActivation('any-page'), {
            wrapper: buildWrapper(),
        })

        expect(result.current.ActivationButton).toBeDefined()
        expect(result.current.ActivationModal).toBeDefined()
        expect(result.current.EarlyAccessModal).toBeDefined()

        expect(result.current.EarlyAccessModal()?.props.isOpen).toBe(true)

        expect(mockedLogEvent).toHaveBeenCalledWith(
            segment.SegmentEvent.AiAgentActivateEarlyAccessModalViewed,
            { page: 'any-page' },
        )
    })

    it('should return null component for ActivationButton if the feature flag is disabled', () => {
        mockUseFlag.mockImplementation(
            (key, __defaultValue) =>
                (({ [FeatureFlagKey.AiAgentActivation]: false }) as any)[key],
        )
        mockedUseEarlyAccessModalState.mockReturnValue(
            defaultUseEarlyAccessModalStateReturnValue,
        )

        const { result } = renderHook(() => useActivation('any-page'), {
            wrapper: buildWrapper(),
        })

        expect(result.current.ActivationButton).toBeDefined()
        expect(result.current.ActivationModal).toBeDefined()
        expect(result.current.EarlyAccessModal).toBeDefined()

        expect(result.current.ActivationButton()).toBeNull()
    })

    it('should not display the previewModal when clicking on sales button if user is on new plan', () => {
        const setIsPreviewModalVisibleMocked = jest.fn()
        mockedUseEarlyAccessModalState.mockReturnValue({
            ...defaultUseEarlyAccessModalStateReturnValue,
            isOnNewPlan: true,
            setIsPreviewModalVisible: setIsPreviewModalVisibleMocked,
        })

        const { result } = renderHook(() => useActivation('any-page'), {
            wrapper: buildWrapper(),
        })

        const onSaleEnabledResult = result.current
            .ActivationModal()
            .props.onSalesEnabled()
        expect(onSaleEnabledResult).toBe(true)
        expect(setIsPreviewModalVisibleMocked).not.toHaveBeenCalled()
    })

    it('should display the previewModal when clicking on sales button if user is not on new plan', () => {
        const setIsPreviewModalVisibleMocked = jest.fn()
        mockedUseEarlyAccessModalState.mockReturnValue({
            ...defaultUseEarlyAccessModalStateReturnValue,
            isOnNewPlan: false,
            setIsPreviewModalVisible: setIsPreviewModalVisibleMocked,
        })

        const { result } = renderHook(() => useActivation('any-page'), {
            wrapper: buildWrapper(),
        })

        const onSaleEnabledResult = result.current
            .ActivationModal()
            .props.onSalesEnabled()
        expect(onSaleEnabledResult).toBe(false)
        expect(setIsPreviewModalVisibleMocked).toHaveBeenCalled()
    })
})
