import {act, renderHook} from '@testing-library/react-hooks'
import useWorkflowConfiguration from '../useWorkflowConfiguration'
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

    it('errors when editing a not existing configuration', () => {
        updateMock({
            fetchWorkflowConfiguration: () => Promise.resolve(null),
        })
        const {result} = renderHook(() => useWorkflowConfiguration('a', false))
        expect(result.current.hookError).toBeDefined()
    })

    it('reflect changes on workflow name', async () => {
        updateMock({
            fetchWorkflowConfiguration: () =>
                Promise.resolve({
                    id: 'a',
                    name: 'remote name',
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
        act(() => result.current.setWorkflowName('local name'))
        rerender()
        expect(result.current.configuration.name).toBe('local name')
        expect(result.current.isDirty).toBe(true)

        // save
        act(() => void result.current.handleSave())
        await waitForNextUpdate()
        expect(result.current.isSavePending).toBe(false)
        expect(result.current.isDirty).toBe(false)

        // edit again
        act(() => result.current.setWorkflowName('updated'))
        expect(result.current.isDirty).toBe(true)
        // and discard
        act(() => result.current.handleDiscard())
        expect(result.current.isDirty).toBe(false)
        expect(result.current.configuration.name).toBe('local name')
    })
})
