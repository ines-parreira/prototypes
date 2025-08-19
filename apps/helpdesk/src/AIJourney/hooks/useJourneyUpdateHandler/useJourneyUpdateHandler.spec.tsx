import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { Integration } from '@gorgias/helpdesk-types'

import { useUpdateJourney } from 'AIJourney/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useJourneyUpdateHandler } from './useUpdateJourneyHandler'

jest.mock('AIJourney/queries', () => ({
    useUpdateJourney: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => jest.fn())

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

describe('useJourneyUpdateHandler', () => {
    const mockDispatch = jest.fn()
    const mockMutateAsync = jest.fn()

    let queryClient: QueryClient

    const createWrapper = () => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })

        return ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
        ;(useUpdateJourney as jest.Mock).mockReturnValue({
            mutateAsync: mockMutateAsync,
        })
    })

    it('should call updateJourney with the correct parameters', async () => {
        const params = {
            integrationId: 1,
            currentIntegration: {
                id: 1,
                name: 'Test Integration',
                type: 'email',
            } as Integration,
            abandonedCartJourney: { id: 'journey-id' },
            followUpValue: 3,
            isDiscountEnabled: true,
            discountValue: '10',
            journeyMessageInstructions: 'Test instructions',
            phoneNumberValue: {
                phone_number: '+1234567890',
                integrations: [{ type: 'sms', id: 'sms-id' }],
                id: 'mock-id',
                name: 'Mock Phone',
                phone_number_friendly: '+1 (234) 567-890',
                connections: [],
                created_datetime: new Date().toISOString(),
                updated_datetime: new Date().toISOString(),
                provider: 'mock',
                status: 'active',
            } as unknown as NewPhoneNumber,
        }

        const { result } = renderHook(() => useJourneyUpdateHandler(params), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.handleUpdate()
        })

        expect(mockMutateAsync).toHaveBeenCalledWith({
            journeyId: 'journey-id',
            params: {
                state: 'active',
                message_instructions: 'Test instructions',
            },
            journeyConfigs: {
                max_follow_up_messages: 3,
                offer_discount: true,
                max_discount_percent: 10,
                sms_sender_integration_id: 'sms-id',
                sms_sender_number: '+1234567890',
            },
        })
    })

    it('should dispatch a notification on error', async () => {
        mockMutateAsync.mockRejectedValueOnce(new Error('Test error'))

        const params = {
            integrationId: 1,
            currentIntegration: {
                id: 1,
                name: 'Test Integration',
                type: 'email',
            } as Integration,
            abandonedCartJourney: { id: 'journey-id' },
            followUpValue: 3,
            isDiscountEnabled: true,
            discountValue: '10',
            phoneNumberValue: {
                phone_number: '+1234567890',
                integrations: [{ type: 'sms', id: 'sms-id' }],
                id: 'mock-id',
                name: 'Mock Phone',
                phone_number_friendly: '+1 (234) 567-890',
                connections: [],
                created_datetime: new Date().toISOString(),
                updated_datetime: new Date().toISOString(),
                provider: 'mock',
                status: 'active',
            } as unknown as NewPhoneNumber,
        }

        const { result } = renderHook(() => useJourneyUpdateHandler(params), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await expect(result.current.handleUpdate()).rejects.toThrow(
                'Test error',
            )
        })

        expect(mockDispatch).toHaveBeenCalledWith(
            notify({
                message: 'Error updating journey: Error: Test error',
                status: NotificationStatus.Error,
            }),
        )
    })

    it('should throw an error if required parameters are missing', async () => {
        const params = {
            integrationId: undefined,
            currentIntegration: undefined,
            abandonedCartJourney: undefined,
        }

        const { result } = renderHook(() => useJourneyUpdateHandler(params), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await expect(result.current.handleUpdate()).rejects.toThrow(
                'Missing integration information: ID: undefined, name: undefined, journey ID: undefined',
            )
        })

        expect(mockMutateAsync).not.toHaveBeenCalled()
    })
})
