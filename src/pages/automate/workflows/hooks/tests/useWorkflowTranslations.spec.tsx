import React, { ReactChildren } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act } from '@testing-library/react-hooks'
import { strict as assert } from 'assert'
import { ulid } from 'ulidx'

import {
    useDeleteWorkflowConfigurationTranslations,
    useFetchWorkflowConfigurationTranslations,
    useUpsertWorkflowConfigurationTranslations,
} from 'models/workflows/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import { VisualBuilderGraph } from '../../models/visualBuilderGraph.types'
import {
    transformWorkflowConfigurationIntoVisualBuilderGraph,
    WorkflowConfigurationBuilder,
} from '../../models/workflowConfiguration.model'
import { LanguageCode } from '../../models/workflowConfiguration.types'
import useWorkflowTranslations from '../useWorkflowTranslations'

let mockStore: Record<string, Record<string, string>> = {}

jest.mock('models/workflows/queries', () => ({
    useFetchWorkflowConfigurationTranslations: jest.fn(),
    useDeleteWorkflowConfigurationTranslations: jest.fn(),
    useUpsertWorkflowConfigurationTranslations: jest.fn(),
}))

const mockedUseFetchWorkflowConfigurationTranslations = jest.mocked(
    useFetchWorkflowConfigurationTranslations,
)
const mockedUseDeleteWorkflowConfigurationTranslations = jest.mocked(
    useDeleteWorkflowConfigurationTranslations,
)
const mocedkUseUpsertWorkflowConfigurationTranslations = jest.mocked(
    useUpsertWorkflowConfigurationTranslations,
)

function updateMock() {
    mocedkUseUpsertWorkflowConfigurationTranslations.mockReturnValue({
        mutateAsync: ([{ lang }, translations]: [
            { lang: string },
            Record<string, string>,
        ]) => {
            mockStore[lang] = translations
            return Promise.resolve({ data: translations })
        },
    } as unknown as ReturnType<
        typeof useUpsertWorkflowConfigurationTranslations
    >)
    mockedUseFetchWorkflowConfigurationTranslations.mockReturnValue({
        mutateAsync: ([{ lang }]: [{ lang: string }]) => {
            return Promise.resolve({ data: mockStore[lang] })
        },
    } as unknown as ReturnType<
        typeof useFetchWorkflowConfigurationTranslations
    >)
    mockedUseDeleteWorkflowConfigurationTranslations.mockReturnValue({
        mutateAsync: jest.fn(),
    } as unknown as ReturnType<
        typeof useDeleteWorkflowConfigurationTranslations
    >)
}

const queryClient = mockQueryClient()

const renderHookOptions = {
    wrapper: ({ children }: { children: ReactChildren }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    ),
}

describe('useWorkflowTranslations', () => {
    let graph: VisualBuilderGraph
    const graphTriggerLabelTkey = ulid()

    beforeEach(() => {
        jest.resetAllMocks()
        updateMock()
        mockStore = {}
        const b = new WorkflowConfigurationBuilder({
            id: 'test',
            name: 'test',
            entrypoint: {
                label: 'english text',
                label_tkey: graphTriggerLabelTkey,
            },
            initialStep: {
                id: ulid(),
                kind: 'message',
                settings: {
                    message: {
                        content: {
                            html: 'test',
                            text: 'test',
                        },
                    },
                },
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        graph = transformWorkflowConfigurationIntoVisualBuilderGraph(b.build())
    })

    it('loads translations', async () => {
        const { result } = renderHook(
            () => useWorkflowTranslations('id', ['en-US'], false, true),
            renderHookOptions,
        )
        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    currentLanguage: 'en-US',
                    areTranslationsDirty: false,
                }),
            )
        })
    })

    it('switch language then discard changes', async () => {
        const { result } = renderHook(
            () => useWorkflowTranslations('id', ['en-US'], false, true),
            renderHookOptions,
        )

        await waitFor(() => {
            expect(result.current.currentLanguage).toBe('en-US')
        })

        act(() => {
            graph = result.current.switchLanguage(graph, 'fr-FR')
        })

        expect(
            graph.nodes[0].type === 'channel_trigger' &&
                graph.nodes[0].data.label === '',
        ).toBeTruthy()

        expect(result.current).toEqual(
            expect.objectContaining({
                currentLanguage: 'fr-FR',
                areTranslationsDirty: true,
            }),
        )

        // discard
        act(() => {
            result.current.discardTranslations()
        })

        expect(result.current).toEqual(
            expect.objectContaining({
                currentLanguage: 'en-US',
                areTranslationsDirty: false,
            }),
        )
    })

    it('saves translations', async () => {
        const { result, rerender } = renderHook(
            (availableLanguages: LanguageCode[]) =>
                useWorkflowTranslations('id', availableLanguages, false, true),
            {
                initialProps: ['en-US'] as LanguageCode[],
                ...renderHookOptions,
            } as any,
        )

        await waitFor(() => {
            expect(result.current.currentLanguage).toBe('en-US')
        })

        act(() => {
            graph = result.current.switchLanguage(graph, 'fr-FR')
        })

        rerender(['en-US', 'fr-FR'])

        assert(graph.nodes[0].type === 'channel_trigger')
        graph.nodes[0].data.label = 'french text'

        await act(async () => {
            await result.current.saveTranslations(graph)
        })

        expect(result.current).toEqual(
            expect.objectContaining({
                currentLanguage: 'fr-FR',
                areTranslationsDirty: false,
            }),
        )
        expect(mockStore['fr-FR']).toEqual(
            expect.objectContaining({
                [graphTriggerLabelTkey]: 'french text',
            }),
        )
    })

    it('removes stale translations', async () => {
        const { result, rerender } = renderHook(
            (availableLanguages: LanguageCode[]) =>
                useWorkflowTranslations('id', availableLanguages, false, true),
            {
                initialProps: ['en-US'] as LanguageCode[],
                ...renderHookOptions,
            } as any,
        )

        await waitFor(() => {
            expect(result.current.currentLanguage).toBe('en-US')
        })

        act(() => {
            graph = result.current.switchLanguage(graph, 'fr-FR')
        })

        rerender(['en-US', 'fr-FR'])

        assert(graph.nodes[0].type === 'channel_trigger')
        graph.nodes[0].data.label = 'french text'

        // Remove one node
        graph.nodes.splice(1, 1)

        await act(async () => {
            await result.current.saveTranslations(graph)
        })

        expect(mockStore['fr-FR']).toEqual({
            [graphTriggerLabelTkey]: 'french text',
        })
        expect(mockStore['en-US']).toEqual({
            [graphTriggerLabelTkey]: 'english text',
        })
    })
})
