import {act, renderHook} from '@testing-library/react-hooks'
import {useWorkflowEditor} from '../useWorkflowEditor'
import {WorkflowConfiguration} from '../../models/workflowConfiguration.types'
import useWorkflowApi from '../useWorkflowApi'

const mockStore: Record<string, WorkflowConfiguration> = {}

const {workflowConfigurationFactory} = jest.requireActual('../useWorkflowApi')

const mockWorkflowApi: Partial<ReturnType<typeof useWorkflowApi>> = {
    upsertWorkflowConfiguration: (data: WorkflowConfiguration) => {
        mockStore[data.id] = data
        return Promise.resolve(data)
    },
    fetchWorkflowConfiguration: (workflowId: string) => {
        return Promise.resolve(mockStore?.[workflowId])
    },
    workflowConfigurationFactory,
} as const

jest.mock('../useWorkflowApi')

function updateMock(overrides: Partial<ReturnType<typeof useWorkflowApi>>) {
    ;(useWorkflowApi as jest.MockedFn<typeof useWorkflowApi>).mockReturnValue({
        ...mockWorkflowApi,
        ...overrides,
    } as ReturnType<typeof useWorkflowApi>)
}

describe('useWorkflowEditor', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        updateMock({})
    })
    it('generates an empty workflow configuration when is new', () => {
        const {result} = renderHook(() => useWorkflowEditor(1, 'a', true))
        expect(result.current.configuration.name).toEqual('')
    })

    it('errors when editing a not existing configuration', async () => {
        updateMock({
            fetchWorkflowConfiguration: () => Promise.resolve(null),
        })
        const {result, waitForNextUpdate} = renderHook(() =>
            useWorkflowEditor(1, 'a', false)
        )
        await waitForNextUpdate()
        expect(result.current.hookError).toBeDefined()
    })

    it('reflects changes on workflow name', async () => {
        updateMock({
            fetchWorkflowConfiguration: () =>
                Promise.resolve({
                    id: 'a',
                    internal_id: 'int-a',
                    account_id: 1,
                    is_draft: false,
                    name: 'remote name',
                    initial_step_id: 'messages1',
                    entrypoint: {
                        label: 'entrypoint',
                        label_tkey: 'entrypoint',
                    },
                    steps: [
                        {
                            id: 'messages1',
                            kind: 'messages',
                            settings: {
                                messages: [
                                    {
                                        content: {
                                            text: 'Hello',
                                            html: '<p>Hello</p>',
                                            text_tkey: 'Hello',
                                            html_tkey: '<p>Hello</p>',
                                        },
                                    },
                                ],
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
                            id: 'messages1-handover1',
                            from_step_id: 'messages1',
                            to_step_id: 'handover1',
                        },
                    ],
                } as WorkflowConfiguration),
        })
        const {result, waitForNextUpdate, rerender} = renderHook(() =>
            useWorkflowEditor(1, 'a', false)
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
        expect(result.current.visualBuilderGraph.name).toBe('local name')
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
        expect(result.current.visualBuilderGraph.name).toBe('local name')
    })
})
