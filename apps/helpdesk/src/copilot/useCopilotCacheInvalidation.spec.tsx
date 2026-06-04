import type { ReactNode } from 'react'
import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import type { CopilotToolCallResultInfo } from '@gorgias/copilot'
import { queryKeys as knowledgeServiceQueryKeys } from '@gorgias/knowledge-service-queries'

import { aiGeneratedGuidanceKeys } from 'models/aiAgent/queries'
import { helpCenterKeys } from 'models/helpCenter/queries'
import {
    storeWorkflowsConfigurationDefinitionKeys,
    workflowsConfigurationDefinitionKeys,
} from 'models/workflows/queries'

import { useCopilotCacheInvalidation } from './useCopilotCacheInvalidation'

jest.mock('@gorgias/copilot', () => {
    const listeners: Array<(info: CopilotToolCallResultInfo) => void> = []
    return {
        useCopilot: () => ({ threadId: 'thread-test' }),
        useCopilotToolCallResult: (
            cb: (info: CopilotToolCallResultInfo) => void,
        ) => {
            listeners.push(cb)
        },
        __emit: (info: CopilotToolCallResultInfo) => {
            for (const cb of listeners) cb(info)
        },
        __reset: () => {
            listeners.length = 0
        },
    }
})

const copilotMock = require('@gorgias/copilot') as {
    __emit: (info: CopilotToolCallResultInfo) => void
    __reset: () => void
}

function makeWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
    return { wrapper, invalidateSpy }
}

function makeInfo(fields: {
    toolName: string
    args?: Record<string, unknown>
    result?: unknown
    rawResult?: string
    toolCallId?: string
    threadId?: string
    runId?: string
}): CopilotToolCallResultInfo {
    return {
        toolCallId: 'call-x',
        args: {},
        result: null,
        rawResult: '',
        threadId: 't-1',
        runId: 'r-1',
        ...fields,
    } as CopilotToolCallResultInfo
}

beforeEach(() => {
    copilotMock.__reset()
})

describe('useCopilotCacheInvalidation', () => {
    describe('skill tools', () => {
        it.each([
            {
                toolName: 'update_draft_agent_skill' as const,
                args: { shop_name: 'shop', skill_id: 42 },
                expected: helpCenterKeys.article(7, 42),
            },
            {
                toolName: 'create_draft_agent_skill' as const,
                args: { shop_name: 'shop' },
                expected: helpCenterKeys.articles(7),
            },
            {
                toolName: 'publish_agent_skill' as const,
                args: { shop_name: 'shop', skill_id: 42 },
                expected: helpCenterKeys.articles(7),
            },
            {
                toolName: 'set_agent_skill_status' as const,
                args: { shop_name: 'shop', skill_id: 42, status: 'published' },
                expected: helpCenterKeys.articles(7),
            },
        ])(
            'invalidates precise key on $toolName',
            ({ toolName, args, expected }) => {
                const { wrapper, invalidateSpy } = makeWrapper()
                renderHook(() => useCopilotCacheInvalidation(), { wrapper })

                copilotMock.__emit(
                    makeInfo({
                        toolName,
                        args,
                        result: {
                            id: 42,
                            helpCenterId: 7,
                            intents: ['a'],
                        },
                    }),
                )

                expect(invalidateSpy).toHaveBeenCalledWith({
                    queryKey: expected,
                })
                expect(invalidateSpy).toHaveBeenCalledWith({
                    queryKey: helpCenterKeys.intents(7),
                })
                expect(invalidateSpy).not.toHaveBeenCalledWith({
                    queryKey: helpCenterKeys.details(),
                })
            },
        )

        it('also invalidates the specific article on publish_agent_skill', () => {
            const { wrapper, invalidateSpy } = makeWrapper()
            renderHook(() => useCopilotCacheInvalidation(), { wrapper })

            copilotMock.__emit(
                makeInfo({
                    toolName: 'publish_agent_skill',
                    args: { shop_name: 'shop', skill_id: 42 },
                    result: { id: 42, helpCenterId: 7 },
                }),
            )

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: helpCenterKeys.article(7, 42),
            })
        })

        it('also invalidates the specific article on set_agent_skill_status', () => {
            const { wrapper, invalidateSpy } = makeWrapper()
            renderHook(() => useCopilotCacheInvalidation(), { wrapper })

            copilotMock.__emit(
                makeInfo({
                    toolName: 'set_agent_skill_status',
                    args: {
                        shop_name: 'shop',
                        skill_id: 42,
                        status: 'disabled',
                    },
                    result: { id: 42, helpCenterId: 7 },
                }),
            )

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: helpCenterKeys.article(7, 42),
            })
        })

        it('also invalidates the article list on update_draft_agent_skill', () => {
            const { wrapper, invalidateSpy } = makeWrapper()
            renderHook(() => useCopilotCacheInvalidation(), { wrapper })

            copilotMock.__emit(
                makeInfo({
                    toolName: 'update_draft_agent_skill',
                    args: { shop_name: 'shop', skill_id: 42 },
                    result: { id: 42, helpCenterId: 7 },
                }),
            )

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: helpCenterKeys.articles(7),
            })
        })

        it('falls back to helpCenterKeys.details() when payload is malformed', () => {
            const { wrapper, invalidateSpy } = makeWrapper()
            renderHook(() => useCopilotCacheInvalidation(), { wrapper })

            copilotMock.__emit(
                makeInfo({
                    toolName: 'update_draft_agent_skill',
                    args: { shop_name: 'shop', skill_id: 42 },
                    result: null,
                    rawResult: 'not json',
                }),
            )

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: helpCenterKeys.details(),
            })
        })

        it('falls back when skill tool returned an error envelope', () => {
            const { wrapper, invalidateSpy } = makeWrapper()
            renderHook(() => useCopilotCacheInvalidation(), { wrapper })

            copilotMock.__emit(
                makeInfo({
                    toolName: 'publish_agent_skill',
                    args: { shop_name: 'shop', skill_id: 42 },
                    result: null,
                    rawResult: JSON.stringify({
                        functionCallOutput: {
                            error: true,
                            errorMsg: 'nope',
                        },
                    }),
                }),
            )

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: helpCenterKeys.details(),
            })
        })
    })

    describe('guidance tools', () => {
        it.each([
            {
                toolName: 'update_draft_guidance' as const,
                args: { shop_name: 'shop', article_id: 99 },
                expected: helpCenterKeys.article(3, 99),
            },
            {
                toolName: 'create_draft_guidance' as const,
                args: { shop_name: 'shop' },
                expected: helpCenterKeys.articles(3),
            },
            {
                toolName: 'publish_guidance' as const,
                args: { shop_name: 'shop', article_id: 99 },
                expected: helpCenterKeys.articles(3),
            },
            {
                toolName: 'set_guidance_status' as const,
                args: {
                    shop_name: 'shop',
                    article_id: 99,
                    status: 'published',
                },
                expected: helpCenterKeys.articles(3),
            },
        ])(
            'invalidates precise key on $toolName',
            ({ toolName, args, expected }) => {
                const { wrapper, invalidateSpy } = makeWrapper()
                renderHook(() => useCopilotCacheInvalidation(), { wrapper })

                copilotMock.__emit(
                    makeInfo({
                        toolName,
                        args,
                        result: { id: 99, helpCenterId: 3 },
                    }),
                )

                expect(invalidateSpy).toHaveBeenCalledWith({
                    queryKey: expected,
                })
                expect(invalidateSpy).toHaveBeenCalledWith({
                    queryKey: aiGeneratedGuidanceKeys.all(),
                })
                expect(invalidateSpy).not.toHaveBeenCalledWith({
                    queryKey: helpCenterKeys.details(),
                })
            },
        )

        it('also invalidates the specific article on publish_guidance', () => {
            const { wrapper, invalidateSpy } = makeWrapper()
            renderHook(() => useCopilotCacheInvalidation(), { wrapper })

            copilotMock.__emit(
                makeInfo({
                    toolName: 'publish_guidance',
                    args: { shop_name: 'shop', article_id: 99 },
                    result: { id: 99, helpCenterId: 3 },
                }),
            )

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: helpCenterKeys.article(3, 99),
            })
        })

        it('also invalidates the specific article on set_guidance_status', () => {
            const { wrapper, invalidateSpy } = makeWrapper()
            renderHook(() => useCopilotCacheInvalidation(), { wrapper })

            copilotMock.__emit(
                makeInfo({
                    toolName: 'set_guidance_status',
                    args: {
                        shop_name: 'shop',
                        article_id: 99,
                        status: 'disabled',
                    },
                    result: { id: 99, helpCenterId: 3 },
                }),
            )

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: helpCenterKeys.article(3, 99),
            })
        })

        it('also invalidates the article list on update_draft_guidance', () => {
            const { wrapper, invalidateSpy } = makeWrapper()
            renderHook(() => useCopilotCacheInvalidation(), { wrapper })

            copilotMock.__emit(
                makeInfo({
                    toolName: 'update_draft_guidance',
                    args: { shop_name: 'shop', article_id: 99 },
                    result: { id: 99, helpCenterId: 3 },
                }),
            )

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: helpCenterKeys.articles(3),
            })
        })

        it('falls back when guidance payload is malformed', () => {
            const { wrapper, invalidateSpy } = makeWrapper()
            renderHook(() => useCopilotCacheInvalidation(), { wrapper })

            copilotMock.__emit(
                makeInfo({
                    toolName: 'update_draft_guidance',
                    args: { shop_name: 'shop', article_id: 99 },
                    result: null,
                    rawResult: '{',
                }),
            )

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: helpCenterKeys.details(),
            })
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: aiGeneratedGuidanceKeys.all(),
            })
        })
    })

    describe('support action tools', () => {
        it.each([
            'create_support_action' as const,
            'update_support_action' as const,
            'enable_support_action' as const,
            'disable_support_action' as const,
            'convert_to_advanced_view' as const,
            'create_action_from_template' as const,
        ])('invalidates lists + specific action on %s', (toolName) => {
            const { wrapper, invalidateSpy } = makeWrapper()
            renderHook(() => useCopilotCacheInvalidation(), { wrapper })

            const args =
                toolName === 'create_support_action'
                    ? { shop_name: 'shop' }
                    : toolName === 'create_action_from_template'
                      ? { shop_name: 'shop', template_id: 'tpl_1' }
                      : { shop_name: 'shop', action_id: 'act_xyz' }

            copilotMock.__emit(
                makeInfo({
                    toolName,
                    args,
                    result: { id: 'act_xyz' },
                }),
            )

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: storeWorkflowsConfigurationDefinitionKeys.all(),
            })
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: workflowsConfigurationDefinitionKeys.lists(),
            })
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: workflowsConfigurationDefinitionKeys.get('act_xyz'),
            })
            expect(invalidateSpy).not.toHaveBeenCalledWith({
                queryKey: workflowsConfigurationDefinitionKeys.all(),
            })
        })

        it('falls back to action_id from args when output is malformed', () => {
            const { wrapper, invalidateSpy } = makeWrapper()
            renderHook(() => useCopilotCacheInvalidation(), { wrapper })

            copilotMock.__emit(
                makeInfo({
                    toolName: 'update_support_action',
                    args: { shop_name: 'shop', action_id: 'act_from_args' },
                    result: null,
                    rawResult: 'not json',
                }),
            )

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey:
                    workflowsConfigurationDefinitionKeys.get('act_from_args'),
            })
        })
    })

    describe('process_opportunity', () => {
        it('invalidates only opportunities when frontend_reference is not help-center', () => {
            const { wrapper, invalidateSpy } = makeWrapper()
            renderHook(() => useCopilotCacheInvalidation(), { wrapper })

            copilotMock.__emit(
                makeInfo({
                    toolName: 'process_opportunity',
                    args: { shop_name: 'shop', opportunity_id: 5 },
                    result: {
                        opportunityId: 5,
                        action: 'DISMISS',
                        processed: true,
                        frontendReference: {
                            type: 'opportunity',
                            id: 5,
                            uri: 'x',
                            markdown_link: 'y',
                        },
                    },
                }),
            )

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: knowledgeServiceQueryKeys.opportunities.all(),
            })
            expect(invalidateSpy).not.toHaveBeenCalledWith({
                queryKey: helpCenterKeys.details(),
            })
        })

        it('also invalidates the help-center root when an opportunity created a guidance', () => {
            const { wrapper, invalidateSpy } = makeWrapper()
            renderHook(() => useCopilotCacheInvalidation(), { wrapper })

            copilotMock.__emit(
                makeInfo({
                    toolName: 'process_opportunity',
                    args: { shop_name: 'shop', opportunity_id: 5 },
                    result: {
                        opportunityId: 5,
                        action: 'APPROVE',
                        processed: true,
                        frontendReference: {
                            type: 'guidance',
                            id: 17,
                            uri: 'x',
                            markdown_link: 'y',
                        },
                    },
                }),
            )

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: knowledgeServiceQueryKeys.opportunities.all(),
            })
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: helpCenterKeys.details(),
            })
        })
    })

    it('does nothing for non-mutating tools', () => {
        const { wrapper, invalidateSpy } = makeWrapper()
        renderHook(() => useCopilotCacheInvalidation(), { wrapper })

        copilotMock.__emit(makeInfo({ toolName: 'list_agent_skills' }))
        copilotMock.__emit(makeInfo({ toolName: 'get_guidance' }))
        copilotMock.__emit(makeInfo({ toolName: 'ask_clarifying_questions' }))

        expect(invalidateSpy).not.toHaveBeenCalled()
    })
})
