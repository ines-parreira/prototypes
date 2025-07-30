import { waitFor } from '@testing-library/react'

import { client, setDefaultConfig } from '@gorgias/knowledge-service-client'

import { AiAgentFeedbackTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { isProduction, isStaging } from 'utils/environment'
import authInterceptor from 'utils/gorgiasAppsAuth'

import {
    generateUniqueId,
    getKsApiBaseURL,
    optimisticallyUpdateFeedback,
    setKSDefaultConfig,
} from '../utils'

jest.mock('utils/environment', () => ({
    isProduction: jest.fn(),
    isStaging: jest.fn(),
}))

jest.mock('@gorgias/knowledge-service-client')

jest.mock('utils/gorgiasAppsAuth', () => ({
    GorgiasAppAuthService: jest.fn(),
    authInterceptor: jest.fn(),
}))

describe('knowledgeService utils', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getKsApiBaseURL', () => {
        it('should return production URL when isProduction returns true', () => {
            ;(isProduction as jest.Mock).mockReturnValue(true)
            ;(isStaging as jest.Mock).mockReturnValue(false)

            const result = getKsApiBaseURL()

            expect(result).toBe('https://knowledge-service.gorgias.help')
        })

        it('should return staging URL when isProduction returns false and isStaging returns true', () => {
            ;(isProduction as jest.Mock).mockReturnValue(false)
            ;(isStaging as jest.Mock).mockReturnValue(true)

            const result = getKsApiBaseURL()

            expect(result).toBe('https://knowledge-service.gorgias.rehab')
        })

        it('should return localhost URL when both isProduction and isStaging return false', () => {
            ;(isProduction as jest.Mock).mockReturnValue(false)
            ;(isStaging as jest.Mock).mockReturnValue(false)

            const result = getKsApiBaseURL()

            expect(result).toBe('http://localhost:9500')
        })
    })

    describe('setKSDefaultConfig', () => {
        beforeEach(() => {
            ;(isProduction as jest.Mock).mockReturnValue(false)
            ;(isStaging as jest.Mock).mockReturnValue(false)
        })

        it('should call setDefaultConfig with async function', () => {
            setKSDefaultConfig()

            expect(setDefaultConfig).toHaveBeenCalledTimes(1)
            expect(setDefaultConfig).toHaveBeenCalledWith(expect.any(Function))
        })

        it('should return correct config when async function is called', async () => {
            setKSDefaultConfig()

            const asyncConfigFn = (setDefaultConfig as jest.Mock).mock
                .calls[0][0]
            const config = await asyncConfigFn()

            expect(config).toEqual({
                baseURL: 'http://localhost:9500',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        })

        it('should work with production environment', async () => {
            ;(isProduction as jest.Mock).mockReturnValue(true)
            ;(isStaging as jest.Mock).mockReturnValue(false)

            setKSDefaultConfig()

            const asyncConfigFn = (setDefaultConfig as jest.Mock).mock
                .calls[0][0]
            const config = await asyncConfigFn()

            expect(config.baseURL).toBe(
                'https://knowledge-service.gorgias.help',
            )
        })

        it('should set the auth interceptor', async () => {
            setKSDefaultConfig()

            const asyncConfigFn = (setDefaultConfig as jest.Mock).mock
                .calls[0][0]

            await asyncConfigFn()

            await waitFor(() => {
                expect(
                    client.client.interceptors.request.use,
                ).toHaveBeenCalledWith(authInterceptor)
            })
        })
    })

    describe('generateUniqueId', () => {
        it('should return 0 when no executions exist', () => {
            const data: any = {
                executions: undefined,
            }

            const result = generateUniqueId(data)

            expect(result).toBe(0)
        })

        it('should return 1 when executions array is empty', () => {
            const data: any = {
                executions: [],
            }

            const result = generateUniqueId(data)

            expect(result).toBe(1) // maxId starts at 0, returns maxId + 1
        })

        it('should return max id + 1 when feedback items exist', () => {
            const data: any = {
                executions: [
                    {
                        feedback: [{ id: 5 }, { id: 2 }],
                    },
                    {
                        feedback: [{ id: 8 }, { id: 1 }],
                    },
                ],
            }

            const result = generateUniqueId(data)

            expect(result).toBe(9) // max id (8) + 1
        })

        it('should handle feedback items with non-numeric ids', () => {
            const data: any = {
                executions: [
                    {
                        feedback: [{ id: 'string-id' }, { id: 3 }],
                    },
                ],
            }

            const result = generateUniqueId(data)

            expect(result).toBe(4) // only considers numeric id (3) + 1
        })
    })

    describe('optimisticallyUpdateFeedback', () => {
        const mockParams: any = {
            objectId: 'ticket-123',
            objectType: 'TICKET',
        }

        const createMockPrevData = (): any => ({
            data: {
                executions: [
                    {
                        executionId: 'exec1',
                        feedback: [],
                        resources: [],
                    },
                ],
            },
        })

        it('should return unchanged data when prevData is undefined', () => {
            const upsertRequest: any = {
                feedbackToUpsert: [],
            }

            const updater = optimisticallyUpdateFeedback(
                mockParams,
                upsertRequest,
            )
            const result = updater(undefined)

            expect(result).toBeUndefined()
        })

        describe('TICKET_RATING feedback', () => {
            it('should add new ticket rating feedback', () => {
                const prevData = createMockPrevData()
                const upsertRequest: any = {
                    feedbackToUpsert: [
                        {
                            id: 1,
                            executionId: 'exec1',
                            objectType: 'TICKET',
                            targetId: 'ticket-123',
                            feedbackType: AiAgentFeedbackTypeEnum.TICKET_RATING,
                            feedbackValue: 'GOOD',
                        },
                    ],
                }

                const updater = optimisticallyUpdateFeedback(
                    mockParams,
                    upsertRequest,
                )
                const result = updater(prevData)

                expect(result?.data.executions[0].feedback).toHaveLength(1)
                expect(result?.data.executions[0].feedback[0]).toMatchObject({
                    id: 1,
                    feedbackType: AiAgentFeedbackTypeEnum.TICKET_RATING,
                    feedbackValue: 'GOOD',
                    targetType: 'TICKET',
                })
            })

            it('should update existing ticket rating feedback', () => {
                const prevData = createMockPrevData()
                prevData.data.executions[0].feedback = [
                    {
                        id: 1,
                        feedbackType: AiAgentFeedbackTypeEnum.TICKET_RATING,
                        feedbackValue: 'GOOD',
                    },
                ]
                const upsertRequest: any = {
                    feedbackToUpsert: [
                        {
                            id: 1,
                            executionId: 'exec1',
                            objectType: 'TICKET',
                            targetId: 'ticket-123',
                            feedbackType: AiAgentFeedbackTypeEnum.TICKET_RATING,
                            feedbackValue: 'BAD',
                        },
                    ],
                }

                const updater = optimisticallyUpdateFeedback(
                    mockParams,
                    upsertRequest,
                )
                const result = updater(prevData)

                expect(result?.data.executions[0].feedback).toHaveLength(1)
                expect(
                    result?.data.executions[0].feedback[0].feedbackValue,
                ).toBe('BAD')
            })

            it('should remove existing feedback when feedbackValue is null', () => {
                const prevData = createMockPrevData()
                prevData.data.executions[0].feedback = [
                    {
                        id: 1,
                        feedbackType: AiAgentFeedbackTypeEnum.TICKET_RATING,
                        feedbackValue: 'GOOD',
                    },
                ]
                const upsertRequest: any = {
                    feedbackToUpsert: [
                        {
                            id: 1,
                            executionId: 'exec1',
                            objectType: 'TICKET',
                            targetId: 'ticket-123',
                            feedbackType: AiAgentFeedbackTypeEnum.TICKET_RATING,
                            feedbackValue: null,
                        },
                    ],
                }

                const updater = optimisticallyUpdateFeedback(
                    mockParams,
                    upsertRequest,
                )
                const result = updater(prevData)

                expect(result?.data.executions[0].feedback).toHaveLength(0)
            })
        })

        describe('TICKET_BAD_INTERACTION_REASON feedback', () => {
            it('should add new bad interaction reason feedback when no existing execution', () => {
                const prevData = createMockPrevData()
                const upsertRequest: any = {
                    feedbackToUpsert: [
                        {
                            id: 2,
                            executionId: 'exec1',
                            objectType: 'TICKET',
                            targetId: 'ticket-123',
                            feedbackType:
                                AiAgentFeedbackTypeEnum.TICKET_BAD_INTERACTION_REASON,
                            feedbackValue: 'irrelevant',
                        },
                    ],
                }

                const updater = optimisticallyUpdateFeedback(
                    mockParams,
                    upsertRequest,
                )
                const result = updater(prevData)

                expect(result?.data.executions[0].feedback).toHaveLength(1)
                expect(result?.data.executions[0].feedback[0]).toMatchObject({
                    id: 2,
                    feedbackType:
                        AiAgentFeedbackTypeEnum.TICKET_BAD_INTERACTION_REASON,
                    feedbackValue: 'irrelevant',
                })
            })

            it('should always add new feedback for bad interaction reason (sets feedback to undefined)', () => {
                const prevData = createMockPrevData()
                // Create an execution that already has TICKET_BAD_INTERACTION_REASON feedback
                prevData.data.executions[0].feedback = [
                    {
                        id: 1,
                        feedbackType:
                            AiAgentFeedbackTypeEnum.TICKET_BAD_INTERACTION_REASON,
                        feedbackValue: 'existing_reason',
                    },
                ]
                const upsertRequest: any = {
                    feedbackToUpsert: [
                        {
                            id: 2,
                            executionId: 'exec1',
                            objectType: 'TICKET',
                            targetId: 'ticket-123',
                            feedbackType:
                                AiAgentFeedbackTypeEnum.TICKET_BAD_INTERACTION_REASON,
                            feedbackValue: 'new_reason',
                        },
                    ],
                }

                const updater = optimisticallyUpdateFeedback(
                    mockParams,
                    upsertRequest,
                )
                const result = updater(prevData)

                expect(result?.data.executions[0].feedback).toHaveLength(2)
                expect(
                    result?.data.executions[0].feedback[1].feedbackValue,
                ).toBe('new_reason')
            })
        })

        describe('SUGGESTED_RESOURCE feedback', () => {
            it('should add new suggested resource feedback', () => {
                const prevData = createMockPrevData()
                const upsertRequest: any = {
                    feedbackToUpsert: [
                        {
                            id: 3,
                            executionId: 'exec1',
                            objectType: 'TICKET',
                            targetId: 'resource-123',
                            targetType: 'RESOURCE',
                            feedbackType:
                                AiAgentFeedbackTypeEnum.SUGGESTED_RESOURCE,
                            feedbackValue: 'helpful',
                        },
                    ],
                }

                const updater = optimisticallyUpdateFeedback(
                    mockParams,
                    upsertRequest,
                )
                const result = updater(prevData)

                expect(result?.data.executions[0].feedback).toHaveLength(1)
                expect(result?.data.executions[0].feedback[0]).toMatchObject({
                    id: 3,
                    feedbackType: AiAgentFeedbackTypeEnum.SUGGESTED_RESOURCE,
                    feedbackValue: 'helpful',
                    targetType: 'RESOURCE',
                })
            })

            it('should update existing suggested resource feedback with new value', () => {
                const prevData = createMockPrevData()
                prevData.data.executions[0].feedback = [
                    {
                        id: 3,
                        feedbackType:
                            AiAgentFeedbackTypeEnum.SUGGESTED_RESOURCE,
                        feedbackValue: 'old_value',
                        executionId: 'exec1',
                    },
                ]
                const upsertRequest: any = {
                    feedbackToUpsert: [
                        {
                            id: 3,
                            executionId: 'exec1',
                            objectType: 'TICKET',
                            targetId: 'resource-123',
                            targetType: 'RESOURCE',
                            feedbackType:
                                AiAgentFeedbackTypeEnum.SUGGESTED_RESOURCE,
                            feedbackValue: 'new_helpful_value',
                        },
                    ],
                }

                const updater = optimisticallyUpdateFeedback(
                    mockParams,
                    upsertRequest,
                )
                const result = updater(prevData)

                expect(result?.data.executions[0].feedback).toHaveLength(1)
                expect(
                    result?.data.executions[0].feedback[0].feedbackValue,
                ).toBe('new_helpful_value')
            })

            it('should remove suggested resource feedback when feedbackValue is null', () => {
                const prevData = createMockPrevData()
                prevData.data.executions[0].feedback = [
                    {
                        id: 3,
                        feedbackType:
                            AiAgentFeedbackTypeEnum.SUGGESTED_RESOURCE,
                        feedbackValue: 'helpful',
                        executionId: 'exec1',
                    },
                ]
                const upsertRequest: any = {
                    feedbackToUpsert: [
                        {
                            id: 3,
                            executionId: 'exec1',
                            objectType: 'TICKET',
                            targetId: 'resource-123',
                            targetType: 'RESOURCE',
                            feedbackType:
                                AiAgentFeedbackTypeEnum.SUGGESTED_RESOURCE,
                            feedbackValue: null,
                        },
                    ],
                }

                const updater = optimisticallyUpdateFeedback(
                    mockParams,
                    upsertRequest,
                )
                const result = updater(prevData)

                expect(result?.data.executions[0].feedback).toHaveLength(0)
            })

            it('should add feedback to first execution when no matching execution found', () => {
                const prevData = createMockPrevData()
                const upsertRequest: any = {
                    feedbackToUpsert: [
                        {
                            id: 3,
                            executionId: 'non-matching-exec',
                            objectType: 'TICKET',
                            targetId: 'resource-123',
                            targetType: 'RESOURCE',
                            feedbackType:
                                AiAgentFeedbackTypeEnum.SUGGESTED_RESOURCE,
                            feedbackValue: 'helpful',
                        },
                    ],
                }

                const updater = optimisticallyUpdateFeedback(
                    mockParams,
                    upsertRequest,
                )
                const result = updater(prevData)

                expect(result?.data.executions[0].feedback).toHaveLength(1)
                expect(result?.data.executions[0].feedback[0]).toMatchObject({
                    id: 3,
                    feedbackType: AiAgentFeedbackTypeEnum.SUGGESTED_RESOURCE,
                    feedbackValue: 'helpful',
                })
            })
        })

        describe('KNOWLEDGE_RESOURCE_BINARY feedback', () => {
            it('should add feedback to existing resource without feedback', () => {
                const prevData = createMockPrevData()
                prevData.data.executions[0].resources = [
                    {
                        id: 'resource-123',
                        title: 'Test Resource',
                        content: 'Test content',
                        feedback: { id: 4 }, // Resource with feedback that has matching ID
                    },
                ]
                const upsertRequest: any = {
                    feedbackToUpsert: [
                        {
                            id: 4,
                            executionId: 'exec1',
                            objectType: 'TICKET',
                            targetId: 'resource-123',
                            targetType: 'RESOURCE',
                            feedbackType:
                                AiAgentFeedbackTypeEnum.KNOWLEDGE_RESOURCE_BINARY,
                            feedbackValue: 'thumbs_up',
                        },
                    ],
                }

                const updater = optimisticallyUpdateFeedback(
                    mockParams,
                    upsertRequest,
                )
                const result = updater(prevData)

                expect(
                    result?.data.executions[0].resources[0].feedback,
                ).toMatchObject({
                    id: 4,
                    feedbackValue: 'thumbs_up', // Only feedbackValue is updated for existing feedback
                })
            })

            it('should add feedback to resource when no existing feedback', () => {
                const prevData = createMockPrevData()
                prevData.data.executions[0].resources = [
                    {
                        id: 'resource-123',
                        title: 'Test Resource',
                        content: 'Test content',
                        // No existing feedback - this won't match feedback?.id === item.id
                    },
                ]
                const upsertRequest: any = {
                    feedbackToUpsert: [
                        {
                            id: 4,
                            executionId: 'exec1',
                            objectType: 'TICKET',
                            targetId: 'resource-123',
                            targetType: 'RESOURCE',
                            feedbackType:
                                AiAgentFeedbackTypeEnum.KNOWLEDGE_RESOURCE_BINARY,
                            feedbackValue: 'thumbs_up',
                        },
                    ],
                }

                const updater = optimisticallyUpdateFeedback(
                    mockParams,
                    upsertRequest,
                )
                const result = updater(prevData)

                // Resource should have new feedback added
                expect(
                    result?.data.executions[0].resources[0].feedback,
                ).toMatchObject({
                    id: 4,
                    feedbackValue: 'thumbs_up',
                })
            })

            it('should return data unchanged when no matching execution found for resource', () => {
                const prevData = createMockPrevData()
                // No resources in execution
                const upsertRequest: any = {
                    feedbackToUpsert: [
                        {
                            id: 4,
                            executionId: 'exec1',
                            objectType: 'TICKET',
                            targetId: 'nonexistent-resource',
                            targetType: 'RESOURCE',
                            feedbackType:
                                AiAgentFeedbackTypeEnum.KNOWLEDGE_RESOURCE_BINARY,
                            feedbackValue: 'thumbs_up',
                        },
                    ],
                }

                const updater = optimisticallyUpdateFeedback(
                    mockParams,
                    upsertRequest,
                )
                const result = updater(prevData)

                // Function continues but returns the data unchanged
                expect(result).toEqual(prevData)
            })

            it('should return data unchanged when execution exists but no resource with targetId found', () => {
                const prevData = createMockPrevData()
                prevData.data.executions[0].resources = [
                    {
                        id: 'different-resource-id',
                        title: 'Different Resource',
                        content: 'Different content',
                    },
                ]
                const upsertRequest: any = {
                    feedbackToUpsert: [
                        {
                            id: 4,
                            executionId: 'exec1',
                            objectType: 'TICKET',
                            targetId: 'nonexistent-resource',
                            targetType: 'RESOURCE',
                            feedbackType:
                                AiAgentFeedbackTypeEnum.KNOWLEDGE_RESOURCE_BINARY,
                            feedbackValue: 'thumbs_up',
                        },
                    ],
                }

                const updater = optimisticallyUpdateFeedback(
                    mockParams,
                    upsertRequest,
                )
                const result = updater(prevData)

                expect(result).toEqual(prevData)
            })
        })

        it('should skip null/undefined feedback items', () => {
            const prevData = createMockPrevData()
            const upsertRequest: any = {
                feedbackToUpsert: [
                    null,
                    undefined,
                    {
                        id: 1,
                        executionId: 'exec1',
                        objectType: 'TICKET',
                        targetId: 'ticket-123',
                        feedbackType: AiAgentFeedbackTypeEnum.TICKET_RATING,
                        feedbackValue: 'GOOD',
                    },
                ],
            }

            const updater = optimisticallyUpdateFeedback(
                mockParams,
                upsertRequest,
            )
            const result = updater(prevData)

            expect(result?.data.executions[0].feedback).toHaveLength(1)
            expect(result?.data.executions[0].feedback[0].feedbackValue).toBe(
                'GOOD',
            )
        })

        it('should handle unknown feedback types gracefully', () => {
            const prevData = createMockPrevData()
            const upsertRequest: any = {
                feedbackToUpsert: [
                    {
                        id: 1,
                        executionId: 'exec1',
                        objectType: 'TICKET',
                        targetId: 'ticket-123',
                        feedbackType: 'UNKNOWN_TYPE' as any,
                        feedbackValue: 'test',
                    },
                ],
            }

            const updater = optimisticallyUpdateFeedback(
                mockParams,
                upsertRequest,
            )
            const result = updater(prevData)

            // Should not crash and return the original data
            expect(result?.data.executions[0].feedback).toHaveLength(0)
        })
    })
})
