import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { selfServiceConfiguration1 as mockSelfServiceConfiguration } from 'fixtures/self_service_configurations'
import { ReturnActionType } from 'models/selfServiceConfiguration/types'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'

import useReturnOrderFlow from './useReturnOrderFlow'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'my-store' }),
}))

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')

const mockHandleUpdate = jest.fn()

const configWithPolicy = {
    ...mockSelfServiceConfiguration,
    returnOrderPolicy: {
        enabled: true,
        eligibilities: [
            { key: 'order_delivered_at', value: '30', operator: 'lt' },
        ],
        exceptions: [],
        action: {
            type: ReturnActionType.AutomatedResponse as const,
            responseMessageContent: { html: '<p>test</p>', text: 'test' },
        },
    },
}

describe('useReturnOrderFlow', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: configWithPolicy,
            storeIntegration: { id: 1 },
            isFetchPending: false,
            isUpdatePending: false,
            handleSelfServiceConfigurationUpdate: mockHandleUpdate,
        })
    })

    it('should return loading state when fetch is pending', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: true,
            isUpdatePending: false,
            handleSelfServiceConfigurationUpdate: mockHandleUpdate,
        })

        const { result } = renderHook(() => useReturnOrderFlow())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return eligibility and action from configuration', () => {
        const { result } = renderHook(() => useReturnOrderFlow())

        expect(result.current.eligibility).toEqual({
            key: 'order_delivered_at',
            value: '30',
            operator: 'lt',
        })
        expect(result.current.action).toEqual({
            type: ReturnActionType.AutomatedResponse,
            responseMessageContent: { html: '<p>test</p>', text: 'test' },
        })
    })

    it('should fallback to DEFAULT_RETURN_ACTION when action is null', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: {
                ...configWithPolicy,
                returnOrderPolicy: {
                    ...configWithPolicy.returnOrderPolicy,
                    action: null,
                },
            },
            storeIntegration: { id: 1 },
            isFetchPending: false,
            isUpdatePending: false,
            handleSelfServiceConfigurationUpdate: mockHandleUpdate,
        })

        const { result } = renderHook(() => useReturnOrderFlow())

        expect(result.current.action).toEqual({
            type: ReturnActionType.AutomatedResponse,
            responseMessageContent: { html: '', text: '' },
        })
    })

    it('should fallback to DEFAULT_RETURN_ACTION when action is undefined', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: {
                ...configWithPolicy,
                returnOrderPolicy: {
                    enabled: true,
                    eligibilities: [],
                    exceptions: [],
                },
            },
            storeIntegration: { id: 1 },
            isFetchPending: false,
            isUpdatePending: false,
            handleSelfServiceConfigurationUpdate: mockHandleUpdate,
        })

        const { result } = renderHook(() => useReturnOrderFlow())

        expect(result.current.action).toEqual({
            type: ReturnActionType.AutomatedResponse,
            responseMessageContent: { html: '', text: '' },
        })
    })

    it('should mark as dirty after eligibility change', () => {
        const { result } = renderHook(() => useReturnOrderFlow())

        expect(result.current.isDirty).toBe(false)

        act(() => {
            result.current.handleEligibilityChange({
                key: 'order_created_at',
                value: '10',
                operator: 'lt',
            })
        })

        expect(result.current.isDirty).toBe(true)
    })

    it('should mark as dirty after action change', () => {
        const { result } = renderHook(() => useReturnOrderFlow())

        act(() => {
            result.current.handleActionChange({
                type: ReturnActionType.LoopReturns,
                integrationId: 42,
            })
        })

        expect(result.current.isDirty).toBe(true)
    })

    it('should not call handleSelfServiceConfigurationUpdate on save when configuration is undefined', async () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: undefined,
            storeIntegration: null,
            isFetchPending: false,
            isUpdatePending: false,
            handleSelfServiceConfigurationUpdate: mockHandleUpdate,
        })

        const { result } = renderHook(() => useReturnOrderFlow())

        await act(async () => {
            await result.current.handleSave()
        })

        expect(mockHandleUpdate).not.toHaveBeenCalled()
    })

    it('should call handleSelfServiceConfigurationUpdate on save', async () => {
        const { result } = renderHook(() => useReturnOrderFlow())

        await act(async () => {
            await result.current.handleSave()
        })

        expect(mockHandleUpdate).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should update draft with current return order flow values on save', async () => {
        const { result } = renderHook(() => useReturnOrderFlow())

        act(() => {
            result.current.handleActionChange({
                type: ReturnActionType.LoopReturns,
                integrationId: 42,
            })
        })

        await act(async () => {
            await result.current.handleSave()
        })

        const draftUpdater = mockHandleUpdate.mock.calls[0][0]
        const draft = {
            returnOrderPolicy: {
                exceptions: [],
                eligibilities: [],
                action: null,
            },
        }
        draftUpdater(draft)

        expect(draft.returnOrderPolicy.eligibilities).toEqual([
            { key: 'order_delivered_at', value: '30', operator: 'lt' },
        ])
        expect(draft.returnOrderPolicy.exceptions).toEqual([])
        expect(draft.returnOrderPolicy.action).toEqual({
            type: ReturnActionType.LoopReturns,
            integrationId: 42,
        })
    })

    it('should pass through isUpdatePending', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: configWithPolicy,
            storeIntegration: { id: 1 },
            isFetchPending: false,
            isUpdatePending: true,
            handleSelfServiceConfigurationUpdate: mockHandleUpdate,
        })

        const { result } = renderHook(() => useReturnOrderFlow())

        expect(result.current.isUpdatePending).toBe(true)
    })

    it('should pass through storeIntegration', () => {
        const { result } = renderHook(() => useReturnOrderFlow())

        expect(result.current.storeIntegration).toEqual({ id: 1 })
    })
})
