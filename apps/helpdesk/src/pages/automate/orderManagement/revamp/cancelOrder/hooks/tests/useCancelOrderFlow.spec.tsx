import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { selfServiceConfiguration1 as mockSelfServiceConfiguration } from 'fixtures/self_service_configurations'
import {
    FilterKeyEnum,
    FilterOperatorEnum,
} from 'models/selfServiceConfiguration/types'
import { useSelfServiceConfiguration } from 'pages/automate/common/hooks/useSelfServiceConfiguration'

import { useCancelOrderFlow } from '../useCancelOrderFlow'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'my-store' }),
}))

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')

const mockHandleUpdate = jest.fn()

const configWithPolicy = {
    ...mockSelfServiceConfiguration,
    cancelOrderPolicy: {
        enabled: true,
        eligibilities: [
            {
                key: FilterKeyEnum.GORGIAS_ORDER_STATUS,
                value: ['unfulfilled'],
                operator: FilterOperatorEnum.ONE_OF,
            },
        ],
        exceptions: [],
        action: {
            type: 'automated_response' as const,
            responseMessageContent: { html: '<div>Hi</div>', text: 'Hi' },
        },
    },
}

describe('useCancelOrderFlow', () => {
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

        const { result } = renderHook(() => useCancelOrderFlow())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return eligibility and response message from configuration', () => {
        const { result } = renderHook(() => useCancelOrderFlow())

        expect(result.current.eligibility).toEqual({
            key: FilterKeyEnum.GORGIAS_ORDER_STATUS,
            value: ['unfulfilled'],
            operator: FilterOperatorEnum.ONE_OF,
        })
        expect(result.current.responseMessageContent).toEqual({
            html: '<div>Hi</div>',
            text: 'Hi',
        })
    })

    it('should mark as dirty after eligibility change', () => {
        const { result } = renderHook(() => useCancelOrderFlow())

        expect(result.current.isDirty).toBe(false)

        act(() => {
            result.current.handleEligibilityChange([
                'unfulfilled',
                'processing_fulfillment',
            ])
        })

        expect(result.current.isDirty).toBe(true)
    })

    it('should mark as dirty after response message change', () => {
        const { result } = renderHook(() => useCancelOrderFlow())

        act(() => {
            result.current.handleResponseMessageChange({
                html: '<div>New</div>',
                text: 'New',
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

        const { result } = renderHook(() => useCancelOrderFlow())

        await act(async () => {
            await result.current.handleSave()
        })

        expect(mockHandleUpdate).not.toHaveBeenCalled()
    })

    it('should call handleSelfServiceConfigurationUpdate on save', async () => {
        const { result } = renderHook(() => useCancelOrderFlow())

        await act(async () => {
            await result.current.handleSave()
        })

        expect(mockHandleUpdate).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should update draft with current cancel order flow values on save', async () => {
        const { result } = renderHook(() => useCancelOrderFlow())

        act(() => {
            result.current.handleEligibilityChange([
                'unfulfilled',
                'processing_fulfillment',
            ])
        })

        await act(async () => {
            await result.current.handleSave()
        })

        const draftUpdater = mockHandleUpdate.mock.calls[0][0]
        const draft = {
            cancelOrderPolicy: {
                exceptions: [],
                eligibilities: [],
                action: null,
            },
        }
        draftUpdater(draft)

        expect(draft.cancelOrderPolicy.eligibilities).toEqual([
            {
                key: FilterKeyEnum.GORGIAS_ORDER_STATUS,
                value: ['unfulfilled', 'processing_fulfillment'],
                operator: FilterOperatorEnum.ONE_OF,
            },
        ])
        expect(draft.cancelOrderPolicy.exceptions).toEqual([])
        expect(draft.cancelOrderPolicy.action).toEqual({
            type: 'automated_response',
            responseMessageContent: { html: '<div>Hi</div>', text: 'Hi' },
        })
    })

    it('should reset dirty state on handleReset', () => {
        const { result } = renderHook(() => useCancelOrderFlow())

        act(() => {
            result.current.handleEligibilityChange([
                'unfulfilled',
                'processing_fulfillment',
            ])
        })
        expect(result.current.isDirty).toBe(true)

        act(() => {
            result.current.handleReset()
        })
        expect(result.current.isDirty).toBe(false)
    })
})
