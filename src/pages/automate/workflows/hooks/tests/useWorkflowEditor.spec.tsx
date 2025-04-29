import { waitFor } from '@testing-library/react'
import { act } from '@testing-library/react-hooks'
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
import { renderHookWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { useWorkflowEditor } from '../useWorkflowEditor'

jest.mock('pages/automate/common/hooks/useSelfServiceStoreIntegration')
jest.mock('models/workflows/queries')
jest.mock('pages/automate/workflows/constants', () => ({
    ...jest.requireActual('pages/automate/workflows/constants'),
    MIN_DEBOUNCE_STEP_COUNT: 3,
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

describe('useWorkflowEditor()', () => {
    beforeEach(() => {
        jest.resetAllMocks()

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
    })

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
            mutateAsync: jest.fn().mockImplementation(([, { is_draft }]) => {
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

    it('should reflect changes on workflow name and language', async () => {
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
            result.current.dispatch({ type: 'SET_NAME', name: 'local name' }),
        )

        rerender()

        await waitFor(() => {
            expect(result.current.visualBuilderGraph.name).toBe('local name')
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
            expect(result.current.visualBuilderGraph.name).toBe('local name')
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
            mutateAsync: jest.fn().mockImplementation(([, { is_draft }]) => {
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
            mutateAsync: jest.fn().mockImplementation(([, { is_draft }]) => {
                configuration = produce(configuration, (draft) => {
                    draft.is_draft = is_draft
                })
                return { data: configuration }
            }),
        } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

        const { result } = renderHookWithQueryClientProvider(() =>
            useWorkflowEditor(configuration.id, false),
        )

        act(() => {
            jest.advanceTimersByTime(2000)
        })
        expect(result.current.isDirty).toBe(false)

        expect(result.current.isFetchPending).toBe(false)
        expect(result.current.configuration.steps).toHaveLength(4)
        expect(result.current.configuration.transitions).toHaveLength(3)

        act(() => {
            // Update the name
            result.current.dispatch({
                type: 'SET_NAME',
                name: 'Updated Test Flow',
            })
        })

        // flow updated immediately, dirty should be false
        expect(result.current.isDirty).toBe(false)
        expect(result.current.visualBuilderGraph.name).toBe('Updated Test Flow')

        act(() => {
            jest.advanceTimersByTime(2000)
        })
        expect(result.current.isDirty).toBe(true)
    })
})
