import {act, renderHook} from '@testing-library/react-hooks'
import useWorkflowApi from '../useWorkflowApi'
import useWorkflowTranslations from '../useWorkflowTranslations'
import {VisualBuilderGraph} from '../../models/visualBuilderGraph.types'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../../models/workflowConfiguration.model'
import {LanguageCode} from '../../models/workflowConfiguration.types'

const {workflowConfigurationFactory} = jest.requireActual('../useWorkflowApi')

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
    workflowConfigurationFactory,
} as const

jest.mock('../useWorkflowApi')

const visualBuilderGraphFixture: VisualBuilderGraph =
    transformWorkflowConfigurationIntoVisualBuilderGraph(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        workflowConfigurationFactory()
    )
if (visualBuilderGraphFixture.nodes[0].type === 'trigger_button') {
    visualBuilderGraphFixture.nodes[0].data.label = 'english text'
}

beforeEach(() => {
    ;(useWorkflowApi as jest.MockedFn<typeof useWorkflowApi>).mockReturnValue(
        mockWorkflowApi as ReturnType<typeof useWorkflowApi>
    )
    mockStore = {}
})

describe('useWorkflowTranslations', () => {
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
        let graph = visualBuilderGraphFixture

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
        let graph = visualBuilderGraphFixture
        act(() => {
            graph = result.current.switchLanguage(graph, 'fr-FR')
        })
        // we switched to french that was not existing in available_languages, now it exists
        // we simulate the prop change passed as hook argument
        rerender(['en-US', 'fr-FR'])
        let triggerLabelTkey = ''
        if (graph.nodes[0].type === 'trigger_button') {
            graph.nodes[0].data.label = 'french text'
            triggerLabelTkey = graph.nodes[0].data.label_tkey
        }
        await act(() => result.current.saveTranslations(graph))

        expect(result.current).toEqual(
            expect.objectContaining({
                currentLanguage: 'fr-FR',
                areTranslationsDirty: false,
            })
        )
        expect(mockStore['fr-FR']).toEqual({
            [triggerLabelTkey]: 'french text',
        })
    })

    it('list incomplete translations', async () => {
        const {result, waitForNextUpdate} = renderHook(() =>
            useWorkflowTranslations('id', ['en-US', 'fr-FR'], false, true)
        )
        await waitForNextUpdate()
        let graph = visualBuilderGraphFixture
        act(() => {
            graph = result.current.switchLanguage(graph, 'fr-FR')
        })
        const incompleteLangs =
            result.current.getLangsOfIncompleteTranslations(graph)
        expect(incompleteLangs).toEqual(['fr-FR'])
    })
})
