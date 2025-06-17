import { mockFlags } from 'jest-launchdarkly-mock'

import { DomainEvent } from '@gorgias/events'
import {
    LiveCallQueueVoiceCall,
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
    const mockedDate = new Date(2025, 0, 15, 12, 10)
    const voiceCalls = [
        {
            id: 123,
            external_id: 'abc',
        },
    ] as LiveCallQueueVoiceCall[]

    beforeEach(() => {
        jest.clearAllMocks()
        mockFlags({ [FeatureFlagKey.UseLiveVoiceUpdates]: true })

        jest.useFakeTimers()
        jest.setSystemTime(mockedDate)
    })

    describe('get channel', () => {
        it('should return undefined channel if accountId is not available', () => {
            mockUseAccountId.mockReturnValue(undefined)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates({}, undefined),
            )

            expect(result.current.channel).toBeUndefined()
        })

        it('should return a valid channel if accountId is available', () => {
            const accountId = 'test-account-id'
            mockUseAccountId.mockReturnValue(accountId)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates({}, undefined),
            )

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

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

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

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

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
                    data: [
                        {
                            id: 123,
                            integration_id: 2,
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 123,
                            integration_id: 2,
                        },
                    ],
                },
            })
        })
    })

    describe('handles inbound.rang-agent event', () => {
        const params = {
            agent_ids: [1],
            integration_ids: [2],
            voice_queue_ids: [3],
        }

        const mockEvent = {
            dataschema: '//helpdesk/phone.voice-call.inbound.rang-agent/1.0.0',
            data: {
                voice_call_id: 123,
                account_id: 1,
                user_id: 1,
            },
        } as DomainEvent
        const agentStatus = {
            id: 1,
            name: 'Test Agent',
            profile_picture_url: null,
            online: false,
            available: false,
            forward_calls: false,
            forward_when_offline: false,
            is_available_for_call: false,
            phone_integration_ids: [],
            voice_queue_ids: [],
            call_statuses: [],
        }

        it('should update voice call in the list when an agent is rang', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)

            const mockOldData = {
                data: {
                    data: [
                        {
                            id: 123,
                            status: 'queued',
                            call_sid: 'abc',
                            last_rang_agent_id: null,
                            status_in_queue: 'queued',
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 123,
                            call_sid: 'abc',
                            status: 'queued',
                            last_rang_agent_id: 1,
                            status_in_queue: 'distributing',
                        },
                    ],
                },
            })
        })

        it('should not update voice call if not in the list', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)

            const mockOldData = {
                data: {
                    data: [],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() => useLiveVoiceUpdates(params, []))

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [],
                },
            })
        })

        it('should create the agent status in the live call queue', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

            const mockOldData = {
                data: {
                    data: [agentStatus],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            ...agentStatus,
                            call_statuses: [
                                {
                                    call_sid: 'abc',
                                    status: 'ringing',
                                    created_datetime: mockedDate.toISOString(),
                                },
                            ],
                        },
                    ],
                },
            })
        })

        it('should update the agent status in the live call queue', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

            const mockOldData = {
                data: {
                    data: [
                        {
                            ...agentStatus,
                            call_statuses: [
                                {
                                    call_sid: 'abc',
                                    status: 'dialling',
                                    created_datetime: mockedDate.toISOString(),
                                },
                            ],
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 1,
                            name: 'Test Agent',
                            profile_picture_url: null,
                            online: false,
                            available: false,
                            forward_calls: false,
                            forward_when_offline: false,
                            is_available_for_call: false,
                            phone_integration_ids: [],
                            voice_queue_ids: [],
                            call_statuses: [
                                {
                                    call_sid: 'abc',
                                    status: 'ringing',
                                    created_datetime: mockedDate.toISOString(),
                                },
                            ],
                        },
                    ],
                },
            })
        })

        it('should not update the agent status if the call_sid does not match', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

            const mockOldData = {
                data: {
                    data: [agentStatus],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() => useLiveVoiceUpdates(params, []))

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [agentStatus],
                },
            })
        })
    })

    describe('handles inbound.answered event', () => {
        const params = {
            agent_ids: [1],
            integration_ids: [2],
            voice_queue_ids: [3],
        }

        const mockEvent = {
            dataschema: '//helpdesk/phone.voice-call.inbound.answered/1.0.0',
            data: {
                voice_call_id: 123,
                account_id: 1,
                user_id: 1,
            },
        } as DomainEvent
        const agentStatus = {
            id: 1,
            name: 'Test Agent',
            profile_picture_url: null,
            online: false,
            available: false,
            forward_calls: false,
            forward_when_offline: false,
            is_available_for_call: false,
            phone_integration_ids: [],
            voice_queue_ids: [],
            call_statuses: [],
        }

        it('should update voice call in the list when an agent answered', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)

            const mockOldData = {
                data: {
                    data: [
                        {
                            id: 123,
                            status: 'queued',
                            call_sid: 'abc',
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 123,
                            call_sid: 'abc',
                            status: 'answered',
                            last_answered_by_agent_id: 1,
                        },
                    ],
                },
            })
        })

        it('should not update voice call is not in the list', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)

            const mockOldData = {
                data: {
                    data: [],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() => useLiveVoiceUpdates(params, []))

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [],
                },
            })
        })

        it('should create the agent status in the live call queue', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

            const mockOldData = {
                data: {
                    data: [agentStatus],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            ...agentStatus,
                            call_statuses: [
                                {
                                    call_sid: 'abc',
                                    status: 'in-progress',
                                    created_datetime: mockedDate.toISOString(),
                                },
                            ],
                        },
                    ],
                },
            })
        })

        it('should update the agent status in the live call queue', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

            const mockOldData = {
                data: {
                    data: [
                        {
                            ...agentStatus,
                            call_statuses: [
                                {
                                    call_sid: 'abc',
                                    status: 'dialling',
                                    created_datetime: mockedDate.toISOString(),
                                },
                            ],
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 1,
                            name: 'Test Agent',
                            profile_picture_url: null,
                            online: false,
                            available: false,
                            forward_calls: false,
                            forward_when_offline: false,
                            is_available_for_call: false,
                            phone_integration_ids: [],
                            voice_queue_ids: [],
                            call_statuses: [
                                {
                                    call_sid: 'abc',
                                    status: 'in-progress',
                                    created_datetime: mockedDate.toISOString(),
                                },
                            ],
                        },
                    ],
                },
            })
        })

        it('should not update the agent status if the call_sid does not match', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

            const mockOldData = {
                data: {
                    data: [agentStatus],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() => useLiveVoiceUpdates(params, []))

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [agentStatus],
                },
            })
        })
    })

    describe('handles declined/unanswered events', () => {
        const params = {
            agent_ids: [1],
            integration_ids: [2],
            voice_queue_ids: [3],
        }

        const mockDeclinedEvent = {
            dataschema: '//helpdesk/phone.voice-call.inbound.declined/1.0.0',
            data: {
                voice_call_id: 123,
                account_id: 1,
                user_id: 1,
            },
        } as DomainEvent
        const mockUnansweredEvent = {
            dataschema: '//helpdesk/phone.voice-call.inbound.declined/1.0.0',
            data: {
                voice_call_id: 123,
                account_id: 1,
                user_id: 1,
            },
        } as DomainEvent
        const agentStatus = {
            id: 1,
            name: 'Test Agent',
            profile_picture_url: null,
            online: false,
            available: false,
            forward_calls: false,
            forward_when_offline: false,
            is_available_for_call: false,
            phone_integration_ids: [],
            voice_queue_ids: [],
            call_statuses: [
                {
                    call_sid: 'abc',
                    status: 'ringing',
                    created_datetime: mockedDate.toISOString(),
                },
            ],
        }

        it.each([mockUnansweredEvent, mockDeclinedEvent])(
            'should update agent status in the list when an agent declines a call',
            (event) => {
                const queryKey =
                    queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

                const mockOldData = {
                    data: {
                        data: [agentStatus],
                    },
                }
                appQueryClient.setQueryData(queryKey, mockOldData)

                const { result } = renderHook(() =>
                    useLiveVoiceUpdates(params, voiceCalls),
                )

                result.current.handleEvent(event)

                expect(appQueryClient.getQueryData(queryKey)).toEqual({
                    data: {
                        data: [
                            {
                                ...agentStatus,
                                call_statuses: [],
                            },
                        ],
                    },
                })
            },
        )

        it.each([mockUnansweredEvent, mockDeclinedEvent])(
            'should not update agent status in the list if agent is not in the list',
            (event) => {
                const queryKey =
                    queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

                const mockOldData = {
                    data: {
                        data: [],
                    },
                }
                appQueryClient.setQueryData(queryKey, mockOldData)

                const { result } = renderHook(() =>
                    useLiveVoiceUpdates(params, voiceCalls),
                )

                result.current.handleEvent(event)

                expect(appQueryClient.getQueryData(queryKey)).toEqual({
                    data: {
                        data: [],
                    },
                })
            },
        )

        it.each([mockUnansweredEvent, mockDeclinedEvent])(
            'should not update agent status in the list if the call is not in the list',
            (event) => {
                const queryKey =
                    queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

                const mockOldData = {
                    data: {
                        data: [agentStatus],
                    },
                }
                appQueryClient.setQueryData(queryKey, mockOldData)

                const { result } = renderHook(() =>
                    useLiveVoiceUpdates(params, []),
                )

                result.current.handleEvent(event)

                expect(appQueryClient.getQueryData(queryKey)).toEqual({
                    data: {
                        data: [agentStatus],
                    },
                })
            },
        )
    })

    describe('handles ticket-associated event', () => {
        const params = {
            agent_ids: [1],
            integration_ids: [2],
            voice_queue_ids: [3],
        }

        it.each([
            '//helpdesk/phone.voice-call.inbound.ticket-associated/1.0.0',
            '//helpdesk/phone.voice-call.outbound.ticket-associated/1.0.0',
        ])('should update the voice call with the ticket ID', (dataschema) => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)

            const mockOldData = {
                data: {
                    data: [
                        {
                            id: 123,
                            status: 'queued',
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() => useLiveVoiceUpdates(params, []))

            const mockEvent = {
                dataschema: dataschema,
                data: {
                    voice_call_id: 123,
                    ticket_id: 456,
                },
            } as DomainEvent

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 123,
                            status: 'queued',
                            ticket_id: 456,
                        },
                    ],
                },
            })
        })

        it.each([
            '//helpdesk/phone.voice-call.inbound.ticket-associated/1.0.0',
            '//helpdesk/phone.voice-call.outbound.ticket-associated/1.0.0',
        ])(
            'should not update the voice call if it is not in the list',
            (dataschema) => {
                const queryKey =
                    queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(
                        params,
                    )

                const mockOldData = {
                    data: {
                        data: [],
                    },
                }
                appQueryClient.setQueryData(queryKey, mockOldData)

                const { result } = renderHook(() =>
                    useLiveVoiceUpdates(params, []),
                )

                const mockEvent = {
                    dataschema: dataschema,
                    data: {
                        voice_call_id: 123,
                        ticket_id: 456,
                    },
                } as DomainEvent
                result.current.handleEvent(mockEvent)

                expect(appQueryClient.getQueryData(queryKey)).toEqual({
                    data: {
                        data: [],
                    },
                })
            },
        )
    })

    describe('handles inbound.enqueued event', () => {
        const params = {
            agent_ids: [1],
            integration_ids: [2],
            voice_queue_ids: [3],
        }
        const queryKey =
            queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)

        it('should update the voice call with the queue ID and status in queue', () => {
            const mockEvent = {
                dataschema:
                    '//helpdesk/phone.voice-call.inbound.enqueued/1.1.0',
                data: {
                    voice_call_id: 123,
                    queue_id: 3,
                    status_in_queue: 'waiting',
                },
            } as DomainEvent
            const mockOldData = {
                data: {
                    data: [
                        {
                            id: 123,
                            status: 'queued',
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() => useLiveVoiceUpdates(params, []))

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 123,
                            status: 'queued',
                            queue_id: 3,
                            status_in_queue: 'waiting',
                        },
                    ],
                },
            })
        })

        it('should not update the voice call if the queue is not in the params', () => {
            const mockEvent = {
                dataschema:
                    '//helpdesk/phone.voice-call.inbound.enqueued/1.1.0',
                data: {
                    voice_call_id: 123,
                    queue_id: 9999,
                    status_in_queue: 'waiting',
                },
            } as DomainEvent
            const mockOldData = {
                data: {
                    data: [
                        {
                            id: 123,
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() => useLiveVoiceUpdates(params, []))

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [],
                },
            })
        })
    })

    describe('handles voice call ended events', () => {
        const params = {
            agent_ids: [1],
            integration_ids: [2],
            voice_queue_ids: [3],
        }

        it.each([
            '//helpdesk/phone.voice-call.inbound.ended/1.1.0',
            '//helpdesk/phone.voice-call.outbound.ended/1.1.0',
            '//helpdesk/phone.voice-call.inbound.ending-triggered/1.1.0',
        ])('should remove the voice call from the list', (dataschema) => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)

            const mockOldData = {
                data: {
                    data: [
                        {
                            id: 123,
                            external_id: 'abc',
                            status: 'queued',
                        },
                    ],
                },
            }
            const mockEvent = {
                dataschema: dataschema,
                data: {
                    voice_call_id: 123,
                },
            } as DomainEvent
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [],
                },
            })
        })

        it.each([
            '//helpdesk/phone.voice-call.inbound.ended/1.1.0',
            '//helpdesk/phone.voice-call.outbound.ended/1.1.0',
            '//helpdesk/phone.voice-call.inbound.ending-triggered/1.1.0',
        ])('should remove the related agent statuses', (dataschema) => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

            const mockOldData = {
                data: {
                    data: [
                        {
                            id: 123,
                            call_statuses: [
                                {
                                    call_sid: 'abc',
                                    status: 'ringing',
                                    created_datetime: mockedDate.toISOString(),
                                },
                            ],
                        },
                        {
                            id: 456,
                            call_statuses: [
                                {
                                    call_sid: 'def',
                                    status: 'dialling',
                                    created_datetime: mockedDate.toISOString(),
                                },
                            ],
                        },
                    ],
                },
            }
            const mockEvent = {
                dataschema: dataschema,
                data: {
                    voice_call_id: 123,
                },
            } as DomainEvent
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 123,
                            call_statuses: [],
                        },
                        {
                            id: 456,
                            call_statuses: [
                                {
                                    call_sid: 'def',
                                    status: 'dialling',
                                    created_datetime: mockedDate.toISOString(),
                                },
                            ],
                        },
                    ],
                },
            })
        })
    })

    describe('handles outbound.started event', () => {
        const params = {
            agent_ids: [1],
            integration_ids: [2],
            voice_queue_ids: [3],
        }
        const queryKey =
            queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)
        const mockEvent = {
            dataschema: '//helpdesk/phone.voice-call.outbound.started/1.0.0',
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
                user_id: 1,
            },
        } as DomainEvent
        const agentStatus = {
            id: 1,
            name: 'Test Agent',
            profile_picture_url: null,
            online: false,
            available: false,
            forward_calls: false,
            forward_when_offline: false,
            is_available_for_call: false,
            phone_integration_ids: [],
            voice_queue_ids: [],
            call_statuses: [],
        }

        it('should handle inbound voice call event and add it to the list', () => {
            const mockOldData = {
                data: {
                    data: [],
                },
            }

            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 123,
                            integration_id: 2,
                            direction: VoiceCallDirection.Outbound,
                            status: VoiceCallStatus.Queued,
                            external_id: 'abc',
                            phone_number_source: '123456789',
                            phone_number_destination: '987654321',
                            started_datetime: expect.any(String),
                            created_datetime: expect.any(String),
                            provider: 'provider',
                            customer_id: 123456,
                            initiated_by_agent_id: 1,
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
                    data: [
                        {
                            id: 123,
                            integration_id: 2,
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 123,
                            integration_id: 2,
                        },
                    ],
                },
            })
        })

        it('should create the agent status in the live call queue', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

            const mockOldData = {
                data: {
                    data: [agentStatus],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            ...agentStatus,
                            call_statuses: [
                                {
                                    call_sid: 'abc',
                                    status: 'ringing',
                                    created_datetime: mockedDate.toISOString(),
                                },
                            ],
                        },
                    ],
                },
            })
        })
    })

    describe('handles outbound.connected event', () => {
        const params = {
            agent_ids: [1],
            integration_ids: [2],
            voice_queue_ids: [3],
        }

        const mockEvent = {
            dataschema: '//helpdesk/phone.voice-call.outbound.connected/1.0.0',
            data: {
                voice_call_id: 123,
                account_id: 1,
                user_id: 1,
            },
        } as DomainEvent
        const agentStatus = {
            id: 1,
            name: 'Test Agent',
            profile_picture_url: null,
            online: false,
            available: false,
            forward_calls: false,
            forward_when_offline: false,
            is_available_for_call: false,
            phone_integration_ids: [],
            voice_queue_ids: [],
            call_statuses: [],
        }

        it('should update voice call in the list when an agent answered', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)

            const mockOldData = {
                data: {
                    data: [
                        {
                            id: 123,
                            status: 'ringing',
                            call_sid: 'abc',
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 123,
                            call_sid: 'abc',
                            status: 'connected',
                        },
                    ],
                },
            })
        })

        it('should not update voice call is not in the list', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)

            const mockOldData = {
                data: {
                    data: [],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() => useLiveVoiceUpdates(params, []))

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [],
                },
            })
        })

        it('should create the agent status in the live call queue', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

            const mockOldData = {
                data: {
                    data: [agentStatus],
                },
            }
            appQueryClient.setQueryData(queryKey, mockOldData)

            const { result } = renderHook(() =>
                useLiveVoiceUpdates(params, voiceCalls),
            )

            result.current.handleEvent(mockEvent)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            ...agentStatus,
                            call_statuses: [
                                {
                                    call_sid: 'abc',
                                    status: 'in-progress',
                                    created_datetime: mockedDate.toISOString(),
                                },
                            ],
                        },
                    ],
                },
            })
        })
    })
})
