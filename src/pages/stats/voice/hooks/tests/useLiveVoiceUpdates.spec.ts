import { mockFlags } from 'jest-launchdarkly-mock'

import { DomainEvent } from '@gorgias/events'
import {
    queryKeys,
    VoiceCallDirection,
    VoiceCallStatus,
} from '@gorgias/helpdesk-queries'
import { useAccountId } from '@gorgias/realtime'

import { appQueryClient } from 'api/queryClient'
import { FeatureFlagKey } from 'config/featureFlags'
import { renderHook } from 'utils/testing/renderHook'

import { useLiveVoiceUpdates } from '../useLiveVoiceUpdates'

jest.mock('@gorgias/realtime', () => ({
    useAccountId: jest.fn(),
}))

const mockUseAccountId = useAccountId as jest.Mock

describe('useLiveVoiceUpdates', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFlags({ [FeatureFlagKey.UseLiveVoiceUpdates]: true })
    })

    describe('get channel', () => {
        it('should return undefined channel if accountId is not available', () => {
            mockUseAccountId.mockReturnValue(undefined)

            const { result } = renderHook(() => useLiveVoiceUpdates())

            expect(result.current.channel).toBeUndefined()
        })

        it('should return a valid channel if accountId is available', () => {
            const accountId = 'test-account-id'
            mockUseAccountId.mockReturnValue(accountId)

            const { result } = renderHook(() => useLiveVoiceUpdates())

            expect(result.current.channel).toEqual({
                name: 'stats.liveVoice',
                accountId,
            })
        })
    })

    describe('handles inbound.received event', () => {
        const params = {
            agent_ids: [1],
            integration_ids: [2],
            voice_queue_ids: [3],
        }
        const queryKey =
            queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)
        const mockEvent = {
            dataschema: '//helpdesk/phone.voice-call.inbound.received/1.0.0',
            data: {
                voice_call_id: 123,
                integration_id: 2,
                status: 'queued',
                call_sid: 'abc',
                phone_number_source: '123456789',
                phone_number_destination: '987654321',
                started_datetime: new Date(),
                created_datetime: new Date(),
                provider: 'provider',
                customer_id: 123456,
            },
        } as DomainEvent

        it('should not do anything if live updates are disabled', () => {
            mockFlags({ [FeatureFlagKey.UseLiveVoiceUpdates]: false })

            const mockOldData = {
                data: {
                    data: [],
                },
            }

            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() => useLiveVoiceUpdates())

            result.current.handleEvent(mockEvent, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [],
                },
            })
        })

        it('should handle inbound voice call event and add it to the list', () => {
            const mockOldData = {
                data: {
                    data: [],
                },
            }

            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() => useLiveVoiceUpdates())

            result.current.handleEvent(mockEvent, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 123,
                            integration_id: 2,
                            direction: VoiceCallDirection.Inbound,
                            status: VoiceCallStatus.Queued,
                            external_id: 'abc',
                            phone_number_source: '123456789',
                            phone_number_destination: '987654321',
                            started_datetime: expect.any(String),
                            created_datetime: expect.any(String),
                            provider: 'provider',
                            customer_id: 123456,
                        },
                    ],
                },
            })
        })

        it('should not add voice call to the list if it does not match filters', () => {
            const params = {
                agent_ids: [1],
                integration_ids: [1],
                voice_queue_ids: [3],
            }
            const mockOldData = {
                data: {
                    data: [],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() => useLiveVoiceUpdates())

            result.current.handleEvent(mockEvent, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: { data: [] },
            })
        })
    })
})
