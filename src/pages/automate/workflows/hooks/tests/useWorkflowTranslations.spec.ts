import {strict as assert} from 'assert'
import {act, renderHook} from '@testing-library/react-hooks'
import {ulid} from 'ulidx'
import useWorkflowApi from '../useWorkflowApi'
import useWorkflowTranslations from '../useWorkflowTranslations'
import {VisualBuilderGraph} from '../../models/visualBuilderGraph.types'
import {
    transformWorkflowConfigurationIntoVisualBuilderGraph,
    WorkflowConfigurationBuilder,
} from '../../models/workflowConfiguration.model'
import {LanguageCode} from '../../models/workflowConfiguration.types'
import {WAS_THIS_HELPFUL_WORKFLOW_ID} from '../../constants'

let mockStore: Record<string, Record<string, string>> = {}

const mockWorkflowApi: Partial<ReturnType<typeof useWorkflowApi>> = {
    upsertWorkflowTranslations: (
        internalId: string,
        language: string,
        translations: Record<string, string>
    ) => {
        mockStore[language] = translations
        return Promise.resolve()
    },
    fetchWorkflowTranslations: (internalId: string, language: string) =>
        Promise.resolve(mockStore[language]),
} as const

jest.mock('../useWorkflowApi')

beforeEach(() => {
    ;(useWorkflowApi as jest.MockedFn<typeof useWorkflowApi>).mockReturnValue(
        mockWorkflowApi as ReturnType<typeof useWorkflowApi>
    )
    mockStore = {}
})

describe('useWorkflowTranslations', () => {
    let graph: VisualBuilderGraph
    const graphTriggerLabelTkey = ulid()

    beforeEach(() => {
        const b = new WorkflowConfigurationBuilder({
            id: 'test',
            name: 'test',
            account_id: 1,
            entrypoint: {
                label: 'english text',
                label_tkey: graphTriggerLabelTkey,
            },
            initialMessage: {
                content: {
                    html: 'test',
                    text: 'test',
                },
            },
        })
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        graph = transformWorkflowConfigurationIntoVisualBuilderGraph(b.build())
    })

    it('loads translations', async () => {
        const {result, waitForNextUpdate} = renderHook(() =>
            useWorkflowTranslations('id', ['en-US'], false, true)
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
        const {result, waitForNextUpdate} = renderHook(() =>
            useWorkflowTranslations('id', ['en-US'], false, true)
        )
        await waitForNextUpdate()

        act(() => {
            graph = result.current.switchLanguage(graph, 'fr-FR')
        })
        expect(
            graph.nodes[0].type === 'trigger_button' &&
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
            }
        )
        await waitForNextUpdate()
        act(() => {
            graph = result.current.switchLanguage(graph, 'fr-FR')
        })
        // we switched to french that was not existing in available_languages, now it exists
        // we simulate the prop change passed as hook argument
        rerender(['en-US', 'fr-FR'])
        assert(graph.nodes[0].type === 'trigger_button')
        graph.nodes[0].data.label = 'french text'

        await act(() => result.current.saveTranslations(graph))

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
        const {result, waitForNextUpdate} = renderHook(() =>
            useWorkflowTranslations('id', ['en-US', 'fr-FR'], false, true)
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
                initialProps: ['en-US'] as LanguageCode[],
            }
        )
        await waitForNextUpdate()
        act(() => {
            graph = result.current.switchLanguage(graph, 'fr-FR')
        })
        // we switched to french that was not existing in available_languages, now it exists
        // we simulate the prop change passed as hook argument
        rerender(['en-US', 'fr-FR'])
        assert(graph.nodes[0].type === 'trigger_button')
        graph.nodes[0].data.label = 'french text'

        // remove node
        graph.nodes.splice(1, 1)

        await act(() => result.current.saveTranslations(graph))

        expect(mockStore['fr-FR']).toEqual({
            [graphTriggerLabelTkey]: 'french text',
        })
        expect(mockStore['en-US']).toEqual({
            [graphTriggerLabelTkey]: 'english text',
        })
    })
})
