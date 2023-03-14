import {act, renderHook} from '@testing-library/react-hooks'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import useWorkflowsEntrypoints from '../useWorkflowsEntrypoints'

const mockSelfServiceConfiguration: ReturnType<
    typeof useSelfServiceConfiguration
> = {
    isFetchPending: false,
    isUpdatePending: false,
    storeIntegration: undefined,
    selfServiceConfiguration: undefined,
    handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
} as const

jest.mock('pages/automation/common/hooks/useSelfServiceConfiguration', () => {
    return {
        __esModule: true,
        default: jest.fn().mockReturnValue(mockSelfServiceConfiguration),
    }
})

function updateMock(
    overrides: Partial<ReturnType<typeof useSelfServiceConfiguration>>
) {
    ;(
        useSelfServiceConfiguration as jest.MockedFn<
            typeof useSelfServiceConfiguration
        >
    ).mockReturnValue({
        ...mockSelfServiceConfiguration,
        ...overrides,
    })
}

const entrypointsFixtures = [
    {enabled: true, workflow_id: 'a', label: 'a'},
    {enabled: true, workflow_id: 'b', label: 'b'},
    {enabled: false, workflow_id: 'c', label: 'c'},
]

describe('useWorflowsEntrypoints', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        updateMock({})
    })
    it('isFetchPending and isUpdatePending', () => {
        updateMock({
            isFetchPending: true,
            isUpdatePending: true,
        })
        const {result} = renderHook(() => useWorkflowsEntrypoints('', ''))
        expect(result.current).toMatchObject({
            isFetchPending: true,
            isUpdatePending: true,
            workflowsEntrypoints: [],
        })
    })

    it('hydrates workflowsEntrypoints once configuration fetched', () => {
        const {result, rerender} = renderHook(() =>
            useWorkflowsEntrypoints('', '')
        )
        updateMock({
            selfServiceConfiguration: {
                workflows_entrypoints: entrypointsFixtures,
            } as SelfServiceConfiguration,
        })
        rerender()
        expect(result.current.workflowsEntrypoints).toEqual(entrypointsFixtures)
    })

    it('handleDragAndDrop', () => {
        updateMock({
            selfServiceConfiguration: {
                workflows_entrypoints: entrypointsFixtures,
            } as SelfServiceConfiguration,
        })
        const {result} = renderHook(() => useWorkflowsEntrypoints('', ''))
        act(() => result.current.handleDragAndDrop(['c', 'a', 'b']))
        expect(result.current.workflowsEntrypoints).toEqual([
            entrypointsFixtures[2],
            ...entrypointsFixtures.slice(0, 2),
        ])
    })

    it('deleteWorkflowEntrypoint', () => {
        updateMock({
            selfServiceConfiguration: {
                workflows_entrypoints: entrypointsFixtures,
            } as SelfServiceConfiguration,
        })
        const {result} = renderHook(() => useWorkflowsEntrypoints('', ''))
        act(() => result.current.deleteWorkflowEntrypoint('a'))
        expect(result.current.workflowsEntrypoints).toEqual([
            ...entrypointsFixtures.slice(1),
        ])
    })

    it('toggleEnabled and isToggleUpdatePending', () => {
        const configuration = {
            workflows_entrypoints: entrypointsFixtures,
        } as SelfServiceConfiguration
        updateMock({
            selfServiceConfiguration: configuration,
        })
        const {result, rerender} = renderHook(() =>
            useWorkflowsEntrypoints('', '')
        )
        act(() => result.current.toggleEnabled('a'))
        expect(result.current.workflowsEntrypoints).toEqual([
            {...entrypointsFixtures[0], enabled: false},
            ...entrypointsFixtures.slice(1),
        ])
        expect(result.current.isToggleUpdatePending('a')).toBe(true)
        // simulate selfServiceConfiguration being refreshed after API update
        updateMock({
            selfServiceConfiguration: {
                ...configuration,
                workflows_entrypoints: result.current.workflowsEntrypoints,
            },
        })
        expect(result.current.isToggleUpdatePending('a')).toBe(true)
        // refresh useCallbacks to use the last selfServiceConfiguration mock
        rerender()
        act(() => result.current.toggleEnabled('a'))
        expect(result.current.workflowsEntrypoints).toEqual(entrypointsFixtures)
    })
})
