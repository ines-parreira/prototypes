import {strict as assert} from 'assert'
import React, {ReactChildren} from 'react'
import {act, renderHook} from '@testing-library/react-hooks'
import {ulid} from 'ulidx'
import {QueryClientProvider} from '@tanstack/react-query'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {
    useFetchWorkflowConfigurationTranslations,
    useDeleteWorkflowConfigurationTranslations,
    useUpsertWorkflowConfigurationTranslations,
} from 'models/workflows/queries'
import useWorkflowTranslations from '../useWorkflowTranslations'
import {VisualBuilderGraph} from '../../models/visualBuilderGraph.types'
import {
    transformWorkflowConfigurationIntoVisualBuilderGraph,
    WorkflowConfigurationBuilder,
} from '../../models/workflowConfiguration.model'
import {LanguageCode} from '../../models/workflowConfiguration.types'

let mockStore: Record<string, Record<string, string>> = {}

jest.mock('models/workflows/queries', () => ({
    useFetchWorkflowConfigurationTranslations: jest.fn(),
    useDeleteWorkflowConfigurationTranslations: jest.fn(),
    useUpsertWorkflowConfigurationTranslations: jest.fn(),
}))

const mockedUseFetchWorkflowConfigurationTranslations = jest.mocked(
    useFetchWorkflowConfigurationTranslations
)
const mockedUseDeleteWorkflowConfigurationTranslations = jest.mocked(
    useDeleteWorkflowConfigurationTranslations
)
const mocedkUseUpsertWorkflowConfigurationTranslations = jest.mocked(
    useUpsertWorkflowConfigurationTranslations
)

function updateMock() {
    mocedkUseUpsertWorkflowConfigurationTranslations.mockReturnValue({
        mutateAsync: ([{lang}, translations]: [
            {lang: string},
            Record<string, string>
        ]) => {
            mockStore[lang] = translations
            return Promise.resolve({data: translations})
        },
    } as unknown as ReturnType<typeof useUpsertWorkflowConfigurationTranslations>)
    mockedUseFetchWorkflowConfigurationTranslations.mockReturnValue({
        mutateAsync: ([{lang}]: [{lang: string}]) => {
            return Promise.resolve({data: mockStore[lang]})
        },
    } as unknown as ReturnType<typeof useFetchWorkflowConfigurationTranslations>)
    mockedUseDeleteWorkflowConfigurationTranslations.mockReturnValue({
        mutateAsync: jest.fn(),
    } as unknown as ReturnType<typeof useDeleteWorkflowConfigurationTranslations>)
}

const queryClient = mockQueryClient()

const renderHookOptions = {
    wrapper: ({children}: {children: ReactChildren}) => (
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
        const {result, waitForNextUpdate} = renderHook(
            () => useWorkflowTranslations('id', ['en-US'], false, true),
            renderHookOptions
        )
        await waitForNextUpdate()
        expect(result.current).toEqual(
            expect.objectContaining({
                currentLanguage: 'en-US',
                areTranslationsDirty: false,
            })
        )
    })

    it('switch language then discard changes', async () => {
        const {result, waitForNextUpdate} = renderHook(
            () => useWorkflowTranslations('id', ['en-US'], false, true),
            renderHookOptions
        )
        await waitForNextUpdate()

        act(() => {
            graph = result.current.switchLanguage(graph, 'fr-FR')
        })
        expect(
            graph.nodes[0].type === 'channel_trigger' &&
                graph.nodes[0].data.label === ''
        ).toBeTruthy()
        expect(result.current).toEqual(
            expect.objectContaining({
                currentLanguage: 'fr-FR',
                areTranslationsDirty: true,
            })
        )
        // discard
        act(() => {
            result.current.discardTranslations()
        })
        expect(result.current).toEqual(
            expect.objectContaining({
                currentLanguage: 'en-US',
                areTranslationsDirty: false,
            })
        )
    })

    it('saves translations', async () => {
        const {result, waitForNextUpdate, rerender} = renderHook(
            (availableLanguages: LanguageCode[]) =>
                useWorkflowTranslations('id', availableLanguages, false, true),
            {
                initialProps: ['en-US'] as LanguageCode[],
                ...renderHookOptions,
            } as any
        )
        await waitForNextUpdate()
        act(() => {
            graph = result.current.switchLanguage(graph, 'fr-FR')
        })
        // we switched to french that was not existing in available_languages, now it exists
        // we simulate the prop change passed as hook argument
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
            })
        )
        expect(mockStore['fr-FR']).toEqual(
            expect.objectContaining({
                [graphTriggerLabelTkey]: 'french text',
            })
        )
    })

    it('list incomplete translations', async () => {
        const {result, waitForNextUpdate} = renderHook(
            () =>
                useWorkflowTranslations('id', ['en-US', 'fr-FR'], false, true),
            renderHookOptions
        )
        await waitForNextUpdate()
        act(() => {
            graph = result.current.switchLanguage(graph, 'fr-FR')
        })
        const incompleteLangs =
            result.current.getLangsOfIncompleteTranslations(graph)
        expect(incompleteLangs).toEqual(['fr-FR'])
    })

    it('removes stale translations', async () => {
        const {result, waitForNextUpdate, rerender} = renderHook(
            (availableLanguages: LanguageCode[]) =>
                useWorkflowTranslations('id', availableLanguages, false, true),
            {
                ...renderHookOptions,
                initialProps: ['en-US'] as LanguageCode[],
            } as any
        )
        await waitForNextUpdate()
        act(() => {
            graph = result.current.switchLanguage(graph, 'fr-FR')
        })
        // we switched to french that was not existing in available_languages, now it exists
        // we simulate the prop change passed as hook argument
        rerender(['en-US', 'fr-FR'])
        assert(graph.nodes[0].type === 'channel_trigger')
        graph.nodes[0].data.label = 'french text'

        // remove node
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
