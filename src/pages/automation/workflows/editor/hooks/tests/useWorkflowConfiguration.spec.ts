import {act, renderHook} from '@testing-library/react-hooks'
import {useWorkflowConfiguration, reducer} from '../useWorkflowConfiguration'
import useWorkflowApi, {WorkflowConfiguration} from '../useWorkflowApi'

const mockStore: Record<string, WorkflowConfiguration> = {}

const {workflowConfigurationFactory} = jest.requireActual('../useWorkflowApi')

const mockWorkflowApi: ReturnType<typeof useWorkflowApi> = {
    upsertWorkflowConfiguration: (data: WorkflowConfiguration) => {
        mockStore[data.id] = data
        return Promise.resolve(data)
    },
    fetchWorkflowConfiguration: (workflowId: string) => {
        return Promise.resolve(mockStore?.[workflowId])
    },
    workflowConfigurationFactory,
} as const

jest.mock('../useWorkflowApi', () => ({
    __esModule: true,
    default: jest.fn(),
}))

function updateMock(overrides: Partial<ReturnType<typeof useWorkflowApi>>) {
    ;(useWorkflowApi as jest.MockedFn<typeof useWorkflowApi>).mockReturnValue({
        ...mockWorkflowApi,
        ...overrides,
    })
}

describe('useWorkflowConfiguration', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        updateMock({})
    })
    it('generates an empty workflow configuration when is new', () => {
        const {result} = renderHook(() => useWorkflowConfiguration('a', true))
        expect(result.current.configuration.name).toEqual('')
    })

    it('errors when editing a not existing configuration', async () => {
        updateMock({
            fetchWorkflowConfiguration: () => Promise.resolve(null),
        })
        const {result, waitForNextUpdate} = renderHook(() =>
            useWorkflowConfiguration('a', false)
        )
        await waitForNextUpdate()
        expect(result.current.hookError).toBeDefined()
    })

    it('reflect changes on workflow name', async () => {
        updateMock({
            fetchWorkflowConfiguration: () =>
                Promise.resolve({
                    id: 'a',
                    name: 'remote name',
                    initial_step_id: '',
                    steps: [],
                    transitions: [],
                } as WorkflowConfiguration),
        })
        const {result, waitForNextUpdate, rerender} = renderHook(() =>
            useWorkflowConfiguration('a', false)
        )
        expect(result.current.isFetchPending).toBe(true)
        // wait for asynchronous effect to update the local configuration
        await waitForNextUpdate()
        expect(result.current.isFetchPending).toBe(false)
        expect(result.current.configuration.name).toBe('remote name')
        expect(result.current.isDirty).toBe(false)

        // edit workflow name
        act(() =>
            result.current.dispatch({type: 'SET_NAME', name: 'local name'})
        )
        rerender()
        expect(result.current.configuration.name).toBe('local name')
        expect(result.current.isDirty).toBe(true)

        // save
        act(() => void result.current.handleSave())
        await waitForNextUpdate()
        expect(result.current.isSavePending).toBe(false)
        expect(result.current.isDirty).toBe(false)

        // edit again
        act(() => result.current.dispatch({type: 'SET_NAME', name: 'updated'}))
        expect(result.current.isDirty).toBe(true)
        // and discard
        act(() => result.current.handleDiscard())
        expect(result.current.isDirty).toBe(false)
        expect(result.current.configuration.name).toBe('local name')
    })

    test('configuration reducer', () => {
        const conf: WorkflowConfiguration = {
            id: 'a',
            name: 'a',
            initial_step_id: 's1',
            steps: [
                {
                    id: 's1',
                    kind: 'messages',
                    settings: {
                        messages: [
                            {
                                content: {
                                    html: '',
                                    text: '',
                                },
                            },
                        ],
                        author: {
                            kind: 'bot',
                        },
                    },
                },
            ],
            transitions: [],
        }

        // add reply buttons
        const withReplyButtons = reducer(conf, {
            type: 'ADD_REPLY_BUTTONS',
            step_id: 's1',
        })
        // one choices step pointing to two steps messages should have been added
        const stepsChoices = withReplyButtons.steps.filter(
            (s) => s.kind === 'choices'
        )
        const stepsMessages = withReplyButtons.steps.filter(
            (s) => s.kind === 'messages' && s.id !== 's1'
        )
        const stepMessagesIds = new Set(stepsMessages.map((s) => s.id))
        expect(stepsChoices.length).toEqual(1)
        expect(stepsMessages.length).toEqual(2)
        // there should be a a transition from the s1 step to the choices step
        expect(
            withReplyButtons.transitions.find(
                (t) =>
                    t.from_step_id === 's1' &&
                    t.to_step_id === stepsChoices[0].id
            )
        ).toBeDefined()
        // there should be two transitions starting from the choices step
        // and pointing to the two new messages nodes
        const choicesTransitions = withReplyButtons.transitions.filter(
            (t) => t.from_step_id === stepsChoices[0].id
        )
        expect(choicesTransitions.length).toEqual(2)
        const transitionsTargets = new Set(
            choicesTransitions.map((t) => t.to_step_id)
        )
        expect(transitionsTargets).toEqual(stepMessagesIds)

        const withModifiedReplyButton = reducer(withReplyButtons, {
            type: 'SET_REPLY_BUTTON_LABEL',
            label: 'modified',
            step_id: stepsChoices[0].id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            event_id: (stepsChoices[0].settings as any).choices[0].event_id,
        })
        expect(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (
                withModifiedReplyButton.steps.find(
                    (s) => s.id === stepsChoices[0].id
                )?.settings as any
            ).choices[0].label
        ).toEqual('modified')
    })
})
