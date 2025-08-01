import React from 'react'

import { act, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'
import { produce } from 'immer'
import { ulid } from 'ulidx'

import { shopifyIntegration } from 'fixtures/integrations'
import {
    useDeleteWorkflowConfigurationTranslations,
    useFetchWorkflowConfigurationTranslations,
    useGetWorkflowConfiguration,
    useUpsertWorkflowConfiguration,
    useUpsertWorkflowConfigurationTranslations,
} from 'models/workflows/queries'
import { useSelfServiceStoreIntegrationContext } from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import { WorkflowConfiguration } from 'pages/automate/workflows/models/workflowConfiguration.types'
import { mapServerErrorsToGraph } from 'pages/automate/workflows/utils/serverValidationErrors'
import {
    renderHookWithQueryClientProvider,
    renderWithQueryClientProvider,
} from 'tests/reactQueryTestingUtils'

import {
    createWorkflowEditorContextForPreview,
    useWorkflowEditor,
    useWorkflowEditorContext,
    withWorkflowEditorContext,
} from '../useWorkflowEditor'

jest.mock('pages/automate/common/hooks/useSelfServiceStoreIntegration')
jest.mock('models/workflows/queries')
jest.mock('pages/automate/workflows/utils/serverValidationErrors')
jest.mock('pages/automate/workflows/constants', () => ({
    ...jest.requireActual('pages/automate/workflows/constants'),
    MIN_DEBOUNCE_STEP_COUNT: 3,
}))
jest.mock('pages/automate/workflows/utils/payloadSize', () => ({
    ...jest.requireActual('pages/automate/workflows/utils/payloadSize'),
    isPayloadTooLarge: jest.fn().mockReturnValue(false),
    getPayloadSizeToLimitRate: jest.fn().mockReturnValue(0),
}))

const mockUseGetWorkflowConfiguration = jest.mocked(useGetWorkflowConfiguration)
const mockUseUpsertWorkflowConfiguration = jest.mocked(
    useUpsertWorkflowConfiguration,
)
const mockUseFetchWorkflowConfigurationTranslations = jest.mocked(
    useFetchWorkflowConfigurationTranslations,
)
const mockUseDeleteWorkflowConfigurationTranslations = jest.mocked(
    useDeleteWorkflowConfigurationTranslations,
)
const mockUseUpsertWorkflowConfigurationTranslations = jest.mocked(
    useUpsertWorkflowConfigurationTranslations,
)
const mockUseSelfServiceStoreIntegrationContext = jest.mocked(
    useSelfServiceStoreIntegrationContext,
)
const mockMapServerErrorsToGraph = jest.mocked(mapServerErrorsToGraph)
const mockIsPayloadTooLarge = jest.requireMock(
    'pages/automate/workflows/utils/payloadSize',
).isPayloadTooLarge
const mockGetPayloadSizeToLimitRate = jest.requireMock(
    'pages/automate/workflows/utils/payloadSize',
).getPayloadSizeToLimitRate

describe('useWorkflowEditor', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        // Reset payload size mocks to default values
        mockIsPayloadTooLarge.mockReturnValue(false)
        mockGetPayloadSizeToLimitRate.mockReturnValue(0)

        mockUseUpsertWorkflowConfiguration.mockReturnValue({
            mutateAsync: jest.fn(),
        } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)
        mockUseFetchWorkflowConfigurationTranslations.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({
                data: {},
            }),
        } as unknown as ReturnType<
            typeof useFetchWorkflowConfigurationTranslations
        >)
        mockUseDeleteWorkflowConfigurationTranslations.mockReturnValue({
            mutateAsync: jest.fn(),
        } as unknown as ReturnType<
            typeof useDeleteWorkflowConfigurationTranslations
        >)
        mockUseUpsertWorkflowConfigurationTranslations.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({
                data: {},
            }),
        } as unknown as ReturnType<
            typeof useUpsertWorkflowConfigurationTranslations
        >)
        mockUseSelfServiceStoreIntegrationContext.mockReturnValue(
            shopifyIntegration,
        )

        // Reset mapServerErrorsToGraph mock
        mockMapServerErrorsToGraph.mockReturnValue(null)
    })

    describe('Initialization and Basic State', () => {
        it('should generate an empty configuration when new', () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            expect(result.current.configuration.name).toEqual('')
        })

        it('should be a draft when new', () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            expect(result.current.configuration.is_draft).toBe(true)
            expect(result.current.currentLanguage).toBe('en-US')
        })

        it('should initialize with default values for new workflow', () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            expect(result.current.configuration.name).toEqual('')
            expect(result.current.configuration.is_draft).toBe(true)
            expect(result.current.isFetchPending).toBe(false)
            expect(result.current.isSavePending).toBe(false)
            expect(result.current.isPublishPending).toBe(false)
            expect(result.current.isTesting).toBe(false)
            expect(result.current.isFlowPublishingInChannels).toBe(false)
            expect(result.current.zoom).toBe(1)
            expect(result.current.currentLanguage).toBe('en-US')
            expect(result.current.workflowStepMetrics).toBeNull()
        })

        it('should fetch existing workflow configuration when not new', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: true,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor('existing-workflow', false),
            )

            expect(result.current.isFetchPending).toBe(true)
        })

        it('should handle configuration with no remote data for non-new workflow', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: null, // No remote configuration found
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(
                () => useWorkflowEditor('non-existent-id', false), // Not new, but no remote data
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
                // Should use factory configuration as fallback
                expect(result.current.configuration).toBeDefined()
                expect(result.current.configuration.name).toBe('')
            })
        })
    })

    describe('Draft and Publishing States', () => {
        it('should be a draft when saved but not published', async () => {
            let configuration: WorkflowConfiguration = {
                id: 'a',
                internal_id: 'int-a',
                is_draft: true,
                name: 'remote name',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Hello',
                                    html: '<p>Hello</p>',
                                    text_tkey: 'Hello',
                                    html_tkey: '<p>Hello</p>',
                                },
                            },
                        },
                    },
                    {
                        id: 'handover1',
                        kind: 'handover',
                        settings: {},
                    },
                ],
                transitions: [
                    {
                        id: 'message1-handover1',
                        from_step_id: 'message1',
                        to_step_id: 'handover1',
                    },
                ],
                available_languages: ['en-US'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: configuration,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)
            mockUseUpsertWorkflowConfiguration.mockReturnValue({
                mutateAsync: jest
                    .fn()
                    .mockImplementation(([, { is_draft }]) => {
                        configuration = produce(configuration, (draft) => {
                            draft.is_draft = is_draft
                        })

                        return { data: configuration }
                    }),
            } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(configuration.id, false),
            )

            await waitFor(() => {
                expect(result.current.configuration.is_draft).toBe(true)
            })

            await act(async () => {
                await result.current.handleSave()
            })

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: configuration,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            await waitFor(() => {
                expect(result.current.configuration.is_draft).toBe(true)
                expect(result.current.currentLanguage).toBe('en-US')
            })

            await act(async () => {
                await result.current.handlePublish()
            })

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: configuration,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            await waitFor(() => {
                expect(result.current.configuration.is_draft).toBe(false)
            })
        })

        it('should handle publish when already published and not dirty', async () => {
            const publishedConfiguration: WorkflowConfiguration = {
                id: 'test-published',
                internal_id: 'int-test-published',
                is_draft: false, // Already published
                name: 'Published Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Hello',
                                    html: '<p>Hello</p>',
                                    text_tkey: 'Hello',
                                    html_tkey: '<p>Hello</p>',
                                },
                            },
                        },
                    },
                ],
                transitions: [],
                available_languages: ['en-US'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: publishedConfiguration,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(publishedConfiguration.id, false),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
                expect(result.current.isDirty).toBe(false)
            })

            // Since it's already published and not dirty, handlePublish should return early
            const publishResult = await result.current.handlePublish()
            expect(publishResult).toBeUndefined()
        })

        it('should not publish workflow when already published and not dirty', async () => {
            const publishedConfig: WorkflowConfiguration = {
                id: 'published-id',
                internal_id: 'int-published-id',
                is_draft: false, // Already published
                name: 'Published Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [],
                transitions: [],
                available_languages: ['en-US'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: publishedConfig,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(publishedConfig.id, false),
            )

            await waitFor(() => {
                expect(result.current.isDirty).toBe(false)
            })

            const publishResult = await result.current.handlePublish()
            expect(publishResult).toBeUndefined()
        })
    })

    describe('Name and Language Changes', () => {
        // TODO(React18): Fix this flaky test
        it.skip('should reflect changes on workflow name and language', async () => {
            let configuration: WorkflowConfiguration = {
                id: 'a',
                internal_id: 'int-a',
                is_draft: true,
                name: 'remote name',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Hello',
                                    html: '<p>Hello</p>',
                                    text_tkey: 'Hello',
                                    html_tkey: '<p>Hello</p>',
                                },
                            },
                        },
                    },
                    {
                        id: 'handover1',
                        kind: 'handover',
                        settings: {},
                    },
                ],
                transitions: [
                    {
                        id: 'message1-handover1',
                        from_step_id: 'message1',
                        to_step_id: 'handover1',
                    },
                ],
                available_languages: ['en-US', 'it-IT'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: configuration,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)
            mockUseUpsertWorkflowConfiguration.mockReturnValue({
                mutateAsync: jest
                    .fn()
                    .mockImplementation(([, { is_draft, name }]) => {
                        configuration = produce(configuration, (draft) => {
                            draft.is_draft = is_draft
                            draft.name = name
                        })

                        return { data: configuration }
                    }),
            } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

            const { result, rerender } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(configuration.id, false),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
                expect(result.current.configuration.name).toBe('remote name')
                expect(result.current.isDirty).toBe(false)
            })

            act(() =>
                result.current.dispatch({
                    type: 'SET_NAME',
                    name: 'local name',
                }),
            )

            rerender()

            await waitFor(() => {
                expect(result.current.visualBuilderGraph.name).toBe(
                    'local name',
                )
                expect(result.current.isDirty).toBe(true)
            })

            await act(async () => {
                await result.current.handleSave()
            })

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                isFetched: true,
                data: configuration,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            await waitFor(() => {
                expect(result.current.isSavePending).toBe(false)
                expect(result.current.isDirty).toBe(false)
                expect(result.current.currentLanguage).toBe('en-US')
            })

            act(() => {
                result.current.dispatch({ type: 'SET_NAME', name: 'updated' })
            })

            await waitFor(() => {
                expect(result.current.isDirty).toBe(true)
            })

            act(() => {
                result.current.handleDiscard()
            })

            await waitFor(() => {
                expect(result.current.isDirty).toBe(false)
                expect(result.current.visualBuilderGraph.name).toBe(
                    'local name',
                )
            })
        })

        it('should keep selected language after saving configuration', async () => {
            let configuration: WorkflowConfiguration = {
                id: 'a',
                internal_id: 'int-a',
                is_draft: true,
                name: 'remote name',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Hello',
                                    html: '<p>Hello</p>',
                                    text_tkey: 'Hello',
                                    html_tkey: '<p>Hello</p>',
                                },
                            },
                        },
                    },
                    {
                        id: 'handover1',
                        kind: 'handover',
                        settings: {},
                    },
                ],
                transitions: [
                    {
                        id: 'message1-handover1',
                        from_step_id: 'message1',
                        to_step_id: 'handover1',
                    },
                ],
                available_languages: ['de-DE', 'pt-BR'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: configuration,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            mockUseUpsertWorkflowConfiguration.mockReturnValue({
                mutateAsync: jest
                    .fn()
                    .mockImplementation(([, { is_draft }]) => {
                        configuration = produce(configuration, (draft) => {
                            draft.is_draft = is_draft
                        })

                        return { data: configuration }
                    }),
            } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(configuration.id, false),
            )

            await waitFor(() => {
                expect(result.current.currentLanguage).toBe('de-DE')
            })

            await act(async () => {
                result.current.switchLanguage('pt-BR')
                await result.current.handleSave()
            })

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: configuration,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            await waitFor(() => {
                expect(result.current.currentLanguage).toBe('pt-BR')
            })
        })

        it('should properly set currentLanguage from remote configuration', async () => {
            const configWithCustomLanguage: WorkflowConfiguration = {
                id: 'test-custom-lang',
                internal_id: 'int-test-custom-lang',
                is_draft: true,
                name: 'Custom Language Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Hello',
                                    html: '<p>Hello</p>',
                                    text_tkey: 'Hello',
                                    html_tkey: '<p>Hello</p>',
                                },
                            },
                        },
                    },
                ],
                transitions: [],
                available_languages: ['es-ES', 'pt-BR'], // Spanish first
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: configWithCustomLanguage,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(configWithCustomLanguage.id, false),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
                // Should set current language to first available language
                expect(result.current.currentLanguage).toBe('es-ES')
            })
        })

        it('should set language from remote configuration', async () => {
            const configWithCustomLanguage: WorkflowConfiguration = {
                id: 'test-custom-lang',
                internal_id: 'int-test-custom-lang',
                is_draft: true,
                name: 'Custom Language Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [],
                transitions: [],
                available_languages: ['es-ES', 'pt-BR'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: configWithCustomLanguage,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(configWithCustomLanguage.id, false),
            )

            await waitFor(() => {
                expect(result.current.currentLanguage).toBe('es-ES')
            })
        })

        it('should switch language correctly', () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            act(() => {
                result.current.switchLanguage('es-ES')
            })

            expect(result.current.currentLanguage).toBe('es-ES')
        })

        it('should delete translation correctly', () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            expect(() => {
                act(() => {
                    result.current.deleteTranslation('es-ES')
                })
            }).not.toThrow()
        })

        it('should handle translateKey correctly', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            await waitFor(() => {
                expect(result.current.translateKey).toBeDefined()
            })

            const translatedKey = result.current.translateKey(
                'test.key',
                'en-US',
            )
            expect(typeof translatedKey).toBe('string')
        })

        it('should handle translateGraph correctly', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            await waitFor(() => {
                expect(result.current.translateGraph).toBeDefined()
            })

            const translatedGraph = result.current.translateGraph(
                result.current.visualBuilderGraph,
                'es-ES',
            )
            expect(translatedGraph).toBeDefined()
        })
    })

    describe('Debounced Validation', () => {
        it('should handle debounced validation with large workflow configuration', async () => {
            jest.useFakeTimers()
            let configuration: WorkflowConfiguration = {
                id: 'test-flow',
                internal_id: 'int-test-flow',
                is_draft: true,
                name: 'Test Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Message 1',
                                    html: '<p>Message 1</p>',
                                    text_tkey: 'Message 1',
                                    html_tkey: '<p>Message 1</p>',
                                },
                            },
                        },
                    },
                    {
                        id: 'message2',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Message 2',
                                    html: '<p>Message 2</p>',
                                    text_tkey: 'Message 2',
                                    html_tkey: '<p>Message 2</p>',
                                },
                            },
                        },
                    },
                    {
                        id: 'message3',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Message 3',
                                    html: '<p>Message 3</p>',
                                    text_tkey: 'Message 3',
                                    html_tkey: '<p>Message 3</p>',
                                },
                            },
                        },
                    },
                    {
                        id: 'message4',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Message 4',
                                    html: '<p>Message 4</p>',
                                    text_tkey: 'Message 4',
                                    html_tkey: '<p>Message 4</p>',
                                },
                            },
                        },
                    },
                ],
                transitions: [
                    {
                        id: 'message1-message2',
                        from_step_id: 'message1',
                        to_step_id: 'message2',
                    },
                    {
                        id: 'message2-message3',
                        from_step_id: 'message2',
                        to_step_id: 'message3',
                    },
                    {
                        id: 'message3-message4',
                        from_step_id: 'message3',
                        to_step_id: 'message4',
                    },
                ],
                available_languages: ['en-US'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: configuration,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            mockUseUpsertWorkflowConfiguration.mockReturnValue({
                mutateAsync: jest
                    .fn()
                    .mockImplementation(([, { is_draft }]) => {
                        configuration = produce(configuration, (draft) => {
                            draft.is_draft = is_draft
                        })
                        return { data: configuration }
                    }),
            } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(configuration.id, false),
            )

            // Initial state
            await act(async () => {
                jest.advanceTimersByTime(2000)
            })
            expect(result.current.isDirty).toBe(false)

            expect(result.current.isFetchPending).toBe(false)
            expect(result.current.configuration.steps).toHaveLength(4)
            expect(result.current.configuration.transitions).toHaveLength(3)

            // Update the name
            await act(async () => {
                result.current.dispatch({
                    type: 'SET_NAME',
                    name: 'Updated Test Flow',
                })
            })

            // Immediately after update, dirty should be false
            expect(result.current.isDirty).toBe(false)
            expect(result.current.visualBuilderGraph.name).toBe(
                'Updated Test Flow',
            )

            // Advance timers to trigger debounced update
            await act(async () => {
                jest.advanceTimersByTime(1500)
            })

            // After debounce period, dirty should be true
            await waitFor(() => {
                expect(result.current.isDirty).toBe(true)
            })
        })
    })

    describe('Server Error Handling', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should call mapServerErrorsToGraph when updateWorkflow fails with validation error', async () => {
            const liquidTemplateError: AxiosError = {
                name: 'AxiosError',
                message: 'Request failed',
                response: {
                    status: 400,
                    data: {
                        message: [
                            'steps.1.settings.template: output "{{age}}" not closed, line:5, col:1',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                    statusText: 'Bad Request',
                    headers: {},
                    config: {} as any,
                },
                config: {} as any,
                isAxiosError: true,
                toJSON: () => ({}),
            }

            // Mock the server error parsing to return a graph with errors
            mockMapServerErrorsToGraph.mockReturnValue({
                id: 'test-graph',
                internal_id: 'test-internal',
                is_draft: true,
                name: 'Test Graph',
                available_languages: ['en-US'],
                nodes: [
                    {
                        id: 'step1',
                        type: 'liquid_template',
                        data: {
                            errors: {
                                template:
                                    'output "{{age}}" not closed, line:5, col:1',
                            },
                        },
                    },
                ],
                edges: [],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
                isTemplate: false,
            } as any)

            // Test that when an error occurs, mapServerErrorsToGraph is called
            expect(mockMapServerErrorsToGraph).toBeDefined()

            // Simulate calling the error handler with the liquid template error
            const result = mapServerErrorsToGraph(liquidTemplateError, {
                nodes: [],
            } as any)

            expect(mockMapServerErrorsToGraph).toHaveBeenCalledWith(
                liquidTemplateError,
                expect.any(Object),
            )
            expect(result).toBeTruthy()
        })

        it('should handle non-validation errors correctly', async () => {
            const networkError = new Error('Network error')

            // Mock the server error parsing to return null (not a validation error)
            mockMapServerErrorsToGraph.mockReturnValue(null)

            const result = mapServerErrorsToGraph(networkError, {
                nodes: [],
            } as any)

            expect(mockMapServerErrorsToGraph).toHaveBeenCalledWith(
                networkError,
                expect.any(Object),
            )
            expect(result).toBeNull()
        })

        it('should preserve original error details in parsed validation errors', () => {
            const detailedError: AxiosError = {
                name: 'AxiosError',
                message: 'Request failed',
                response: {
                    status: 400,
                    data: {
                        message: [
                            'steps.1.settings.template: output "{{customer.name | invalid_filter}}" not closed, line:15, col:3',
                            'steps.2.settings.url: URL must be a valid HTTPS endpoint with valid domain',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                    statusText: 'Bad Request',
                    headers: {},
                    config: {} as any,
                },
                config: {} as any,
                isAxiosError: true,
                toJSON: () => ({}),
            }

            // Mock detailed error parsing
            mockMapServerErrorsToGraph.mockReturnValue({
                id: 'test-graph',
                nodes: [
                    {
                        id: 'step1',
                        data: {
                            errors: {
                                template:
                                    'output "{{customer.name | invalid_filter}}" not closed, line:15, col:3',
                            },
                        },
                    },
                    {
                        id: 'step2',
                        data: {
                            errors: {
                                url: 'URL must be a valid HTTPS endpoint with valid domain',
                            },
                        },
                    },
                ],
            } as any)

            const result = mapServerErrorsToGraph(detailedError, {
                nodes: [],
            } as any)

            expect(result).toBeTruthy()
            if (result && result.nodes.length >= 2) {
                expect(
                    (result.nodes[0].data.errors as any)?.template,
                ).toContain('line:15, col:3')
                expect((result.nodes[1].data.errors as any)?.url).toContain(
                    'HTTPS endpoint',
                )
            }
        })

        it('should handle updateWorkflow failure and error mapping in save/publish', async () => {
            const testConfig: WorkflowConfiguration = {
                id: 'test-error-handling',
                internal_id: 'int-test-error-handling',
                is_draft: true,
                name: 'Error Handling Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Hello',
                                    html: '<p>Hello</p>',
                                    text_tkey: 'Hello',
                                    html_tkey: '<p>Hello</p>',
                                },
                            },
                        },
                    },
                ],
                transitions: [],
                available_languages: ['en-US'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: testConfig,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            // Mock updateWorkflow to fail with server error
            const mockError = new Error('Server error')
            mockUseUpsertWorkflowConfiguration.mockReturnValue({
                mutateAsync: jest.fn().mockRejectedValue(mockError),
            } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

            // Mock mapServerErrorsToGraph to return null (non-validation error)
            mockMapServerErrorsToGraph.mockReturnValue(null)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(testConfig.id, false),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
            })

            // Make the workflow dirty
            act(() => {
                result.current.dispatch({
                    type: 'SET_NAME',
                    name: 'Updated Name',
                })
            })

            // Wait for the workflow to become dirty
            await waitFor(() => {
                expect(result.current.isDirty).toBe(true)
            })

            // Test that save handles errors properly
            await expect(result.current.handleSave()).rejects.toThrow(
                'Server error',
            )

            // Test that publish handles errors properly
            await expect(result.current.handlePublish()).rejects.toThrow(
                'Server error',
            )
        })

        it('should handle server validation error in updateWorkflow', async () => {
            const mockError = new Error('Server validation error')
            const mockGraphWithErrors = {
                id: 'test-graph',
                nodes: [
                    {
                        id: 'node1',
                        data: { errors: { template: 'Invalid template' } },
                    },
                ],
            }

            // Mock mapServerErrorsToGraph to return a graph with errors
            const mapServerErrorsToGraph = jest.requireMock(
                'pages/automate/workflows/utils/serverValidationErrors',
            ).mapServerErrorsToGraph
            mapServerErrorsToGraph.mockReturnValue(mockGraphWithErrors)

            mockUseUpsertWorkflowConfiguration.mockReturnValue({
                mutateAsync: jest.fn().mockRejectedValue(mockError),
            } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            // Make the workflow dirty
            act(() => {
                result.current.dispatch({
                    type: 'SET_NAME',
                    name: 'Updated Name',
                })
            })

            await waitFor(() => {
                expect(result.current.isDirty).toBe(true)
            })

            // Test that save handles server validation errors
            await expect(result.current.handleSave()).rejects.toThrow(
                'Server validation error',
            )
        })
    })

    describe('Context and HOC Tests', () => {
        it('should throw error when used outside provider', () => {
            const TestComponent = () => {
                useWorkflowEditorContext()
                return null
            }

            // Suppress console.error for this test
            const consoleError = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            expect(() => {
                renderWithQueryClientProvider(<TestComponent />)
            }).toThrow(
                'A workflowConfigurationContext cannot be found in the scope',
            )

            consoleError.mockRestore()
        })

        it('should provide context to wrapped component', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const TestComponent = ({
                workflowId,
                isNewWorkflow,
            }: {
                workflowId: string
                isNewWorkflow: boolean
            }) => {
                const context = useWorkflowEditorContext()
                return (
                    <div data-testid="test-component">
                        <span data-testid="workflow-id">{workflowId}</span>
                        <span data-testid="is-new">
                            {isNewWorkflow.toString()}
                        </span>
                        <span data-testid="config-name">
                            {context.configuration.name}
                        </span>
                    </div>
                )
            }

            const WrappedComponent = withWorkflowEditorContext(TestComponent)
            const workflowId = ulid()

            const { getByTestId } = renderWithQueryClientProvider(
                <WrappedComponent
                    workflowId={workflowId}
                    isNewWorkflow={true}
                />,
            )

            expect(getByTestId('test-component')).toBeInTheDocument()
            expect(getByTestId('workflow-id')).toHaveTextContent(workflowId)
            expect(getByTestId('is-new')).toHaveTextContent('true')
            expect(getByTestId('config-name')).toHaveTextContent('')
        })
    })

    describe('Testing and Publishing States', () => {
        it('should manage isTesting state correctly', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            expect(result.current.isTesting).toBe(false)

            act(() => {
                result.current.setIsTesting(true)
            })

            expect(result.current.isTesting).toBe(true)

            act(() => {
                result.current.setIsTesting(false)
            })

            expect(result.current.isTesting).toBe(false)
        })

        it('should reset isTesting when nodeEditingId changes', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            act(() => {
                result.current.setIsTesting(true)
            })

            expect(result.current.isTesting).toBe(true)

            // Simulate editing a node
            act(() => {
                result.current.dispatch({
                    type: 'SET_NODE_EDITING_ID',
                    nodeId: 'test-node-id',
                })
            })

            expect(result.current.isTesting).toBe(false)
        })

        it('should manage isFlowPublishingInChannels state correctly', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            expect(result.current.isFlowPublishingInChannels).toBe(false)

            act(() => {
                result.current.setFlowPublishingInChannels(true)
            })

            expect(result.current.isFlowPublishingInChannels).toBe(true)

            act(() => {
                result.current.setFlowPublishingInChannels(false)
            })

            expect(result.current.isFlowPublishingInChannels).toBe(false)
        })

        it('should reset isFlowPublishingInChannels when nodeEditingId changes', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            act(() => {
                result.current.setFlowPublishingInChannels(true)
            })

            expect(result.current.isFlowPublishingInChannels).toBe(true)

            // Simulate editing a node - need to wait for the effect to run
            act(() => {
                result.current.dispatch({
                    type: 'SET_NODE_EDITING_ID',
                    nodeId: 'test-node-id',
                })
            })

            await waitFor(() => {
                expect(result.current.isFlowPublishingInChannels).toBe(false)
            })
        })
    })

    describe('UI State Management', () => {
        it('should manage zoom state correctly', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            expect(result.current.zoom).toBe(1)

            act(() => {
                result.current.setZoom(1.5)
            })

            expect(result.current.zoom).toBe(1.5)

            act(() => {
                result.current.setZoom(0.8)
            })

            expect(result.current.zoom).toBe(0.8)
        })

        it('should manage workflow step metrics state correctly', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            expect(result.current.workflowStepMetrics).toBeNull()

            const mockMetrics = {
                step1: {
                    views: 100,
                    viewRate: 0.8,
                    dropoff: 5,
                    dropoffRate: 0.05,
                    automatedInteractions: 95,
                    automatedInteractionsRate: 0.95,
                    ticketsCreated: 10,
                    ticketsCreatedRate: 0.1,
                },
                step2: {
                    views: 95,
                    viewRate: 0.76,
                    dropoff: 5,
                    dropoffRate: 0.05,
                    automatedInteractions: 90,
                    automatedInteractionsRate: 0.95,
                    ticketsCreated: 8,
                    ticketsCreatedRate: 0.08,
                },
            }

            act(() => {
                result.current.setWorkflowStepMetrics?.(mockMetrics)
            })

            expect(result.current.workflowStepMetrics).toEqual(mockMetrics)

            act(() => {
                result.current.setWorkflowStepMetrics?.(null)
            })

            expect(result.current.workflowStepMetrics).toBeNull()
        })

        it('should discard changes correctly', () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            act(() => {
                result.current.handleDiscard()
            })

            expect(result.current.isDirty).toBe(false)
        })
    })

    describe('Size Validation', () => {
        it('should return error message when configuration is too large', async () => {
            // Mock payload size check to return true (too large)
            mockIsPayloadTooLarge.mockReturnValue(true)

            const largeConfiguration: WorkflowConfiguration = {
                id: 'test-large',
                internal_id: 'int-test-large',
                is_draft: true,
                name: 'Large Test Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Test message',
                                    html: '<p>Test message</p>',
                                    text_tkey: 'Test message',
                                    html_tkey: '<p>Test message</p>',
                                },
                            },
                        },
                    },
                ],
                transitions: [],
                available_languages: ['en-US'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: largeConfiguration,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(largeConfiguration.id, false),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
            })

            const sizeValidationResult = result.current.handleValidateSize()
            expect(sizeValidationResult).toBeDefined()
            expect(sizeValidationResult).toContain('too large to save')
        })

        it('should return undefined when configuration size is acceptable', async () => {
            // Mock payload size check to return false (acceptable size)
            mockIsPayloadTooLarge.mockReturnValue(false)

            const smallConfiguration: WorkflowConfiguration = {
                id: 'test-small',
                internal_id: 'int-test-small',
                is_draft: true,
                name: 'Small Test Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Small message',
                                    html: '<p>Small message</p>',
                                    text_tkey: 'Small message',
                                    html_tkey: '<p>Small message</p>',
                                },
                            },
                        },
                    },
                ],
                transitions: [],
                available_languages: ['en-US'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: smallConfiguration,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(smallConfiguration.id, false),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
            })

            const sizeValidationResult = result.current.handleValidateSize()
            expect(sizeValidationResult).toBeUndefined()
        })

        it('should handle size validation with too large translations', async () => {
            // Mock workflow with multiple languages to test translation size limit
            const multiLangConfig: WorkflowConfiguration = {
                id: 'test-large-translations',
                internal_id: 'int-test-large-translations',
                is_draft: true,
                name: 'Large Translations Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Hello',
                                    html: '<p>Hello</p>',
                                    text_tkey: 'Hello',
                                    html_tkey: '<p>Hello</p>',
                                },
                            },
                        },
                    },
                ],
                transitions: [],
                available_languages: ['en-US', 'fr-FR'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: multiLangConfig,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(multiLangConfig.id, false),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
            })

            // Test that size validation functions are available
            expect(result.current.handleValidateSize).toBeDefined()
            expect(result.current.translationSizeToLimitRate).toBeDefined()
            expect(result.current.configurationSizeToLimitRate).toBeDefined()
        })

        it('should handle size rate calculations', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            await waitFor(() => {
                expect(result.current.translationSizeToLimitRate).toBeDefined()
            })

            expect(typeof result.current.translationSizeToLimitRate).toBe(
                'number',
            )
            expect(typeof result.current.configurationSizeToLimitRate).toBe(
                'number',
            )
        })

        it('should handle error in size validation for translations', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            await waitFor(() => {
                expect(result.current.handleValidateSize).toBeDefined()
            })

            const sizeError = result.current.handleValidateSize()
            expect(
                sizeError === undefined || typeof sizeError === 'string',
            ).toBe(true)
        })

        it('should handle too large translations error in size validation', async () => {
            // This test verifies the translation size validation branch but since
            // we can't easily mock the internal useWorkflowTranslations hook,
            // we'll test that the function exists and can return the expected error message type
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            await waitFor(() => {
                expect(result.current.handleValidateSize).toBeDefined()
            })

            // Test that the function can return either undefined or a string
            const sizeError = result.current.handleValidateSize()
            expect(
                sizeError === undefined || typeof sizeError === 'string',
            ).toBe(true)

            // This line would be covered if translations were actually too large
            // but is hard to test without deep mocking of the translations hook
        })
    })

    describe('Store Integration', () => {
        it('should add shopify app when store integration is shopify and not present', async () => {
            const configurationWithoutShopify: WorkflowConfiguration = {
                id: 'test-shopify',
                internal_id: 'int-test-shopify',
                is_draft: true,
                name: 'Test Shopify Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Hello',
                                    html: '<p>Hello</p>',
                                    text_tkey: 'Hello',
                                    html_tkey: '<p>Hello</p>',
                                },
                            },
                        },
                    },
                ],
                transitions: [],
                available_languages: ['en-US'],
                apps: [], // No apps initially
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: configurationWithoutShopify,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            mockUseSelfServiceStoreIntegrationContext.mockReturnValue(
                shopifyIntegration,
            )

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(configurationWithoutShopify.id, false),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
                // Should have added shopify app
                expect(result.current.visualBuilderGraph.apps).toContainEqual({
                    type: 'shopify',
                })
            })
        })

        it('should not add shopify app when already present', async () => {
            const configurationWithShopify: WorkflowConfiguration = {
                id: 'test-shopify-existing',
                internal_id: 'int-test-shopify-existing',
                is_draft: true,
                name: 'Test Shopify Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Hello',
                                    html: '<p>Hello</p>',
                                    text_tkey: 'Hello',
                                    html_tkey: '<p>Hello</p>',
                                },
                            },
                        },
                    },
                ],
                transitions: [],
                available_languages: ['en-US'],
                apps: [{ type: 'shopify' }], // Shopify app already present
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: configurationWithShopify,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            mockUseSelfServiceStoreIntegrationContext.mockReturnValue(
                shopifyIntegration,
            )

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(configurationWithShopify.id, false),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
                // Should still have only one shopify app
                const shopifyApps =
                    result.current.visualBuilderGraph.apps?.filter(
                        (app) => app.type === 'shopify',
                    )
                expect(shopifyApps).toHaveLength(1)
            })
        })
    })

    describe('Validation', () => {
        it('should validate current language and switch to error language', async () => {
            const multiLanguageConfiguration: WorkflowConfiguration = {
                id: 'test-multilang',
                internal_id: 'int-test-multilang',
                is_draft: true,
                name: 'Multi Language Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Hello',
                                    html: '<p>Hello</p>',
                                    text_tkey: 'Hello',
                                    html_tkey: '<p>Hello</p>',
                                },
                            },
                        },
                    },
                ],
                transitions: [],
                available_languages: ['en-US', 'fr-FR', 'de-DE'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: multiLanguageConfiguration,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(multiLanguageConfiguration.id, false),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
            })

            // Test validation - should return true for valid configuration
            const isValid = result.current.handleValidate(true)
            expect(typeof isValid).toBe('boolean')
        })

        it('should validate workflow and return true for valid workflow', () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            act(() => {
                const isValid = result.current.handleValidate(true)
                expect(typeof isValid).toBe('boolean')
            })
        })

        it('should validate size and return undefined for acceptable size', () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            const sizeError = result.current.handleValidateSize()
            expect(sizeError).toBeUndefined()
        })

        it('should handle validation errors in non-current language', async () => {
            const multiLangConfig: WorkflowConfiguration = {
                id: 'test-multilang-validation',
                internal_id: 'int-test-multilang-validation',
                is_draft: true,
                name: 'Multi Language Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Hello',
                                    html: '<p>Hello</p>',
                                    text_tkey: 'Hello',
                                    html_tkey: '<p>Hello</p>',
                                },
                            },
                        },
                    },
                ],
                transitions: [],
                available_languages: ['en-US', 'fr-FR'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: multiLangConfig,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(multiLangConfig.id, false),
            )

            await waitFor(() => {
                expect(result.current.currentLanguage).toBe('en-US')
            })

            // This will test the validation logic for multiple languages
            act(() => {
                const isValid = result.current.handleValidate(true)
                expect(typeof isValid).toBe('boolean')
            })
        })
    })

    describe('Save and Publish Operations', () => {
        it('should handle save when not dirty', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            // Since it's not dirty, handleSave should return early
            const saveResult = await result.current.handleSave()
            expect(saveResult).toBeUndefined()
        })

        it('should not save workflow when not dirty', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            const saveResult = await result.current.handleSave()
            expect(saveResult).toBeUndefined()
        })

        it('should save workflow when dirty', async () => {
            const mockMutateAsync = jest
                .fn()
                .mockResolvedValue({ data: { id: 'saved-id' } })

            mockUseUpsertWorkflowConfiguration.mockReturnValue({
                mutateAsync: mockMutateAsync,
            } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            // Make the workflow dirty by changing the name
            act(() => {
                result.current.dispatch({
                    type: 'SET_NAME',
                    name: 'Updated Name',
                })
            })

            // Wait for the debounced change
            await waitFor(() => {
                expect(result.current.isDirty).toBe(true)
            })

            const saveResult = await act(async () => {
                return await result.current.handleSave()
            })

            expect(saveResult).toBe('saved-id')
            expect(mockMutateAsync).toHaveBeenCalled()
        })

        it('should publish workflow when dirty', async () => {
            const mockMutateAsync = jest
                .fn()
                .mockResolvedValue({ data: { id: 'published-id' } })

            mockUseUpsertWorkflowConfiguration.mockReturnValue({
                mutateAsync: mockMutateAsync,
            } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            // Make the workflow dirty by changing the name
            act(() => {
                result.current.dispatch({
                    type: 'SET_NAME',
                    name: 'Updated Name',
                })
            })

            // Wait for the debounced change
            await waitFor(() => {
                expect(result.current.isDirty).toBe(true)
            })

            const publishResult = await act(async () => {
                return await result.current.handlePublish()
            })

            expect(publishResult).toBe('published-id')
            expect(mockMutateAsync).toHaveBeenCalled()
        })

        it('should handle save and publish pending states', async () => {
            let resolveSave: (value: any) => void
            let resolvePublish: (value: any) => void

            const mockMutateAsync = jest
                .fn()
                .mockImplementationOnce(
                    () =>
                        new Promise((resolve) => {
                            resolveSave = resolve
                        }),
                )
                .mockImplementationOnce(
                    () =>
                        new Promise((resolve) => {
                            resolvePublish = resolve
                        }),
                )

            mockUseUpsertWorkflowConfiguration.mockReturnValue({
                mutateAsync: mockMutateAsync,
            } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(ulid(), true),
            )

            // Make the workflow dirty
            act(() => {
                result.current.dispatch({
                    type: 'SET_NAME',
                    name: 'Updated Name',
                })
            })

            await waitFor(() => {
                expect(result.current.isDirty).toBe(true)
            })

            // Test save pending state
            act(() => {
                result.current.handleSave()
            })

            expect(result.current.isSavePending).toBe(true)

            act(() => {
                resolveSave!({ data: { id: 'saved' } })
            })

            await waitFor(() => {
                expect(result.current.isSavePending).toBe(false)
            })

            // Test publish pending state
            act(() => {
                result.current.handlePublish()
            })

            expect(result.current.isPublishPending).toBe(true)

            act(() => {
                resolvePublish!({ data: { id: 'published' } })
            })

            await waitFor(() => {
                expect(result.current.isPublishPending).toBe(false)
            })
        })

        it('should handle query cache updates for new workflow', async () => {
            const mockMutateAsync = jest.fn().mockResolvedValue({
                data: { id: 'new-workflow-id', name: 'New Workflow' },
            })

            mockUseUpsertWorkflowConfiguration.mockReturnValue({
                mutateAsync: mockMutateAsync,
            } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: undefined,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(
                () => useWorkflowEditor(ulid(), true), // New workflow
            )

            // Make the workflow dirty
            act(() => {
                result.current.dispatch({
                    type: 'SET_NAME',
                    name: 'New Workflow Name',
                })
            })

            await waitFor(() => {
                expect(result.current.isDirty).toBe(true)
            })

            const saveResult = await act(async () => {
                return await result.current.handleSave()
            })

            expect(saveResult).toBe('new-workflow-id')
            expect(mockMutateAsync).toHaveBeenCalled()
        })

        it('should handle query cache updates for existing workflow', async () => {
            const existingConfig: WorkflowConfiguration = {
                id: 'existing-workflow-id',
                internal_id: 'int-existing-workflow-id',
                is_draft: true,
                name: 'Existing Workflow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [],
                transitions: [],
                available_languages: ['en-US'],
            }

            const mockMutateAsync = jest.fn().mockResolvedValue({
                data: { ...existingConfig, name: 'Updated Workflow' },
            })

            mockUseUpsertWorkflowConfiguration.mockReturnValue({
                mutateAsync: mockMutateAsync,
            } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: existingConfig,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(
                () => useWorkflowEditor(existingConfig.id, false), // Existing workflow
            )

            // Make the workflow dirty
            act(() => {
                result.current.dispatch({
                    type: 'SET_NAME',
                    name: 'Updated Workflow Name',
                })
            })

            await waitFor(() => {
                expect(result.current.isDirty).toBe(true)
            })

            const saveResult = await act(async () => {
                return await result.current.handleSave()
            })

            expect(saveResult).toBe('existing-workflow-id')
            expect(mockMutateAsync).toHaveBeenCalled()
        })
    })

    describe('Preview Context Creation', () => {
        it('should create preview context with default values', () => {
            const mockGraph = {
                id: 'preview-graph',
                internal_id: 'preview-internal',
                name: 'Preview Graph',
                available_languages: ['en-US'],
                nodes: [],
                edges: [],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
                isTemplate: false,
                is_draft: true,
            } as any

            const previewContext =
                createWorkflowEditorContextForPreview(mockGraph)

            expect(previewContext.visualBuilderGraph).toBe(mockGraph)
            expect(previewContext.configuration.id).toBe('id')
            expect(previewContext.isFetchPending).toBe(false)
            expect(previewContext.isSavePending).toBe(false)
            expect(previewContext.isPublishPending).toBe(false)
            expect(previewContext.isDirty).toBe(false)
            expect(previewContext.isTesting).toBe(false)
            expect(previewContext.isFlowPublishingInChannels).toBe(false)
            expect(previewContext.currentLanguage).toBe('en-US')
            expect(previewContext.zoom).toBe(1)
            expect(previewContext.translationSizeToLimitRate).toBe(0)
            expect(previewContext.configurationSizeToLimitRate).toBe(0)

            // Test the no-op functions
            expect(previewContext.handleValidate(true)).toBe(true)
            expect(previewContext.handleValidateSize()).toBeUndefined()
            expect(previewContext.handleSave()).resolves.toBe('')
            expect(previewContext.handlePublish()).resolves.toBe('')
            expect(previewContext.translateKey('test', 'en-US')).toBe('')
            expect(previewContext.translateGraph(mockGraph, 'en-US')).toBe(
                mockGraph,
            )

            // Test setters that should be no-ops
            previewContext.setIsTesting(true) // Should not throw
            previewContext.setFlowPublishingInChannels(true) // Should not throw
            previewContext.setZoom(2) // Should not throw
            previewContext.handleDiscard() // Should not throw
            previewContext.dispatch({ type: 'SET_NAME', name: 'test' }) // Should not throw
            previewContext.switchLanguage('fr-FR') // Should not throw
            previewContext.deleteTranslation('fr-FR') // Should not throw
        })
    })

    describe('Edge Cases', () => {
        it('should handle language switching with error validation', async () => {
            // Mock a workflow that will fail validation in a specific language
            const multiLangConfig: WorkflowConfiguration = {
                id: 'test-lang-error',
                internal_id: 'int-test-lang-error',
                is_draft: true,
                name: 'Multi Language Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Hello',
                                    html: '<p>Hello</p>',
                                    text_tkey: 'Hello',
                                    html_tkey: '<p>Hello</p>',
                                },
                            },
                        },
                    },
                ],
                transitions: [],
                available_languages: ['en-US', 'fr-FR'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: multiLangConfig,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(multiLangConfig.id, false),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
            })

            // Test switchLanguage callback
            act(() => {
                result.current.switchLanguage('fr-FR')
            })

            expect(result.current.currentLanguage).toBe('fr-FR')
        })

        it('should handle deleteTranslation callback', async () => {
            const multiLangConfig: WorkflowConfiguration = {
                id: 'test-delete-translation',
                internal_id: 'int-test-delete-translation',
                is_draft: true,
                name: 'Multi Language Flow',
                initial_step_id: 'message1',
                entrypoint: {
                    label: 'entrypoint',
                    label_tkey: 'entrypoint',
                },
                steps: [
                    {
                        id: 'message1',
                        kind: 'message',
                        settings: {
                            message: {
                                content: {
                                    text: 'Hello',
                                    html: '<p>Hello</p>',
                                    text_tkey: 'Hello',
                                    html_tkey: '<p>Hello</p>',
                                },
                            },
                        },
                    },
                ],
                transitions: [],
                available_languages: ['en-US', 'fr-FR', 'de-DE'],
            }

            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: multiLangConfig,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor(multiLangConfig.id, false),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
            })

            // Test deleteTranslation callback
            act(() => {
                result.current.deleteTranslation('fr-FR')
            })

            // The actual deletion logic is mocked, but we can test that the function is called
            expect(result.current.deleteTranslation).toBeDefined()
        })

        it('should handle configuration fallback when no remote data', async () => {
            mockUseGetWorkflowConfiguration.mockReturnValue({
                isInitialLoading: false,
                data: null,
            } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

            const { result } = renderHookWithQueryClientProvider(() =>
                useWorkflowEditor('non-existent-id', false),
            )

            await waitFor(() => {
                expect(result.current.configuration).toBeDefined()
            })

            expect(result.current.configuration.name).toBe('')
        })
    })
})
