import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import { useCampaignActions } from './useCampaignActions'

const mockDeleteCampaign = jest.fn()
jest.mock('AIJourney/queries/useDeleteJourney/useDeleteJourney', () => ({
    useDeleteJourney: () => ({ mutate: mockDeleteCampaign }),
}))

const mockHandleUpdate = jest.fn()
jest.mock('AIJourney/hooks', () => ({
    useJourneyUpdateHandler: () => ({ handleUpdate: mockHandleUpdate }),
}))

const mockCreateNewJourneyMutateAsync = jest.fn()
jest.mock('AIJourney/queries', () => ({
    useCreateNewJourney: () => ({
        mutateAsync: mockCreateNewJourneyMutateAsync,
    }),
}))

const mockGetJourneyData = jest.fn()
jest.mock('AIJourney/queries/useJourneyData/useJourneyData', () => ({
    getJourneyData: (...args: unknown[]) => mockGetJourneyData(...args),
}))

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockHistoryPush }),
}))

describe('useCampaignActions', () => {
    const baseParams = {
        integrationId: 1,
        shopName: 'test-store',
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('starts with the modal closed', () => {
        const { result } = renderHook(() => useCampaignActions(baseParams))
        expect(result.current.modalState).toEqual({ kind: 'closed' })
    })

    describe('remove flow', () => {
        it('opens the remove modal and dispatches delete on confirm', () => {
            const { result } = renderHook(() => useCampaignActions(baseParams))

            act(() => {
                result.current.openRemoveModal('campaign-1')
            })
            expect(result.current.modalState).toEqual({
                kind: 'remove',
                campaignId: 'campaign-1',
            })

            act(() => {
                result.current.confirmRemove()
            })
            expect(mockDeleteCampaign).toHaveBeenCalledWith({
                id: 'campaign-1',
            })
            expect(result.current.modalState).toEqual({ kind: 'closed' })
        })

        it('does not call deleteCampaign when confirmRemove fires without an open remove modal', () => {
            const { result } = renderHook(() => useCampaignActions(baseParams))

            act(() => {
                result.current.confirmRemove()
            })
            expect(mockDeleteCampaign).not.toHaveBeenCalled()
        })
    })

    describe('send flow', () => {
        it('opens the send modal and dispatches the send update on confirm', () => {
            const { result } = renderHook(() => useCampaignActions(baseParams))

            act(() => {
                result.current.openSendModal('campaign-1', true)
            })
            expect(result.current.modalState).toEqual({
                kind: 'send',
                campaignId: 'campaign-1',
                hasIncludedAudiences: true,
            })

            act(() => {
                result.current.confirmSend()
            })
            expect(mockHandleUpdate).toHaveBeenCalledWith({
                id: 'campaign-1',
                campaignState: JourneyCampaignStateEnum.Scheduled,
                scheduledDatetime: null,
            })
            expect(result.current.modalState).toEqual({ kind: 'closed' })
        })
    })

    describe('cancel flow', () => {
        it('opens the cancel modal and dispatches the cancel update on confirm', () => {
            const { result } = renderHook(() => useCampaignActions(baseParams))

            act(() => {
                result.current.openCancelModal('campaign-2')
            })
            expect(result.current.modalState).toEqual({
                kind: 'cancel',
                campaignId: 'campaign-2',
            })

            act(() => {
                result.current.confirmCancel()
            })
            expect(mockHandleUpdate).toHaveBeenCalledWith({
                id: 'campaign-2',
                campaignState: JourneyCampaignStateEnum.Canceled,
            })
            expect(result.current.modalState).toEqual({ kind: 'closed' })
        })
    })

    describe('changeStatus', () => {
        it('forwards the new status when an id is provided', () => {
            const { result } = renderHook(() => useCampaignActions(baseParams))

            act(() => {
                result.current.changeStatus(
                    'campaign-3',
                    JourneyCampaignStateEnum.Paused,
                )
            })
            expect(mockHandleUpdate).toHaveBeenCalledWith({
                id: 'campaign-3',
                campaignState: JourneyCampaignStateEnum.Paused,
            })
        })

        it('does not call handleUpdate when id is empty', () => {
            const { result } = renderHook(() => useCampaignActions(baseParams))

            act(() => {
                result.current.changeStatus('', JourneyCampaignStateEnum.Paused)
            })
            expect(mockHandleUpdate).not.toHaveBeenCalled()
        })
    })

    describe('closeModal', () => {
        it('closes any open modal', () => {
            const { result } = renderHook(() => useCampaignActions(baseParams))

            act(() => {
                result.current.openRemoveModal('campaign-1')
            })
            expect(result.current.modalState.kind).toBe('remove')

            act(() => {
                result.current.closeModal()
            })
            expect(result.current.modalState).toEqual({ kind: 'closed' })
        })
    })

    describe('duplicateJourney', () => {
        it('fetches the journey, creates a copy, and navigates to the new setup page', async () => {
            mockGetJourneyData.mockResolvedValue({
                store_integration_id: 9,
                store_name: 'test-store',
                type: 'campaign',
                campaign: { title: 'Welcome' },
                included_audience_list_ids: ['list-1'],
                excluded_audience_list_ids: [],
                message_instructions: 'hi',
                configuration: {
                    max_follow_up_messages: 2,
                    offer_discount: true,
                    max_discount_percent: 10,
                    sms_sender_integration_id: 4,
                    sms_sender_number: '+15551234567',
                    discount_code_message_threshold: 1,
                },
            })
            mockCreateNewJourneyMutateAsync.mockResolvedValue({
                id: 'new-journey-1',
                type: 'campaign',
            })

            const { result } = renderHook(() => useCampaignActions(baseParams))

            await act(async () => {
                await result.current.duplicateJourney({
                    id: 'campaign-1',
                } as Parameters<typeof result.current.duplicateJourney>[0])
            })

            expect(mockGetJourneyData).toHaveBeenCalledWith('campaign-1')
            expect(mockCreateNewJourneyMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        store_integration_id: 9,
                        store_name: 'test-store',
                        type: 'campaign',
                        campaign: { title: 'Welcome (Copy)' },
                        included_audience_list_ids: ['list-1'],
                        excluded_audience_list_ids: [],
                        message_instructions: 'hi',
                    }),
                    journeyConfigs: expect.objectContaining({
                        max_follow_up_messages: 2,
                        offer_discount: true,
                        max_discount_percent: 10,
                    }),
                }),
            )
            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-store/campaign/setup/new-journey-1',
            )
        })

        it('falls back to "Untitled (Copy)" when the source has no campaign title', async () => {
            mockGetJourneyData.mockResolvedValue({
                store_integration_id: 9,
                store_name: 'test-store',
                type: 'campaign',
                campaign: undefined,
                included_audience_list_ids: [],
                excluded_audience_list_ids: [],
                message_instructions: '',
                configuration: undefined,
            })
            mockCreateNewJourneyMutateAsync.mockResolvedValue({
                id: 'new-journey-2',
                type: 'campaign',
            })

            const { result } = renderHook(() => useCampaignActions(baseParams))

            await act(async () => {
                await result.current.duplicateJourney({
                    id: 'campaign-2',
                } as Parameters<typeof result.current.duplicateJourney>[0])
            })

            expect(mockCreateNewJourneyMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        campaign: { title: 'Untitled (Copy)' },
                    }),
                }),
            )
        })

        it('copies execution_mode_override from the source journey', async () => {
            mockGetJourneyData.mockResolvedValue({
                store_integration_id: 9,
                store_name: 'test-store',
                type: 'campaign',
                campaign: { title: 'Welcome' },
                included_audience_list_ids: [],
                excluded_audience_list_ids: [],
                message_instructions: '',
                execution_mode_override: 'convert-only',
                configuration: undefined,
            })
            mockCreateNewJourneyMutateAsync.mockResolvedValue({
                id: 'new-journey-3',
                type: 'campaign',
            })

            const { result } = renderHook(() => useCampaignActions(baseParams))

            await act(async () => {
                await result.current.duplicateJourney({
                    id: 'campaign-3',
                } as Parameters<typeof result.current.duplicateJourney>[0])
            })

            expect(mockCreateNewJourneyMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        execution_mode_override: 'convert-only',
                    }),
                }),
            )
        })

        it('omits execution_mode_override when the source does not have one', async () => {
            mockGetJourneyData.mockResolvedValue({
                store_integration_id: 9,
                store_name: 'test-store',
                type: 'campaign',
                campaign: { title: 'Welcome' },
                included_audience_list_ids: [],
                excluded_audience_list_ids: [],
                message_instructions: '',
                configuration: undefined,
            })
            mockCreateNewJourneyMutateAsync.mockResolvedValue({
                id: 'new-journey-4',
                type: 'campaign',
            })

            const { result } = renderHook(() => useCampaignActions(baseParams))

            await act(async () => {
                await result.current.duplicateJourney({
                    id: 'campaign-4',
                } as Parameters<typeof result.current.duplicateJourney>[0])
            })

            const call = mockCreateNewJourneyMutateAsync.mock.calls[0][0]
            expect(call.params).not.toHaveProperty('execution_mode_override')
        })
    })
})
