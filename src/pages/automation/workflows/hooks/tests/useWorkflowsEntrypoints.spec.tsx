import React, {ComponentType, ReactChildren} from 'react'
import {act, renderHook} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {waitFor} from '@testing-library/react'
import {RootState, StoreDispatch} from 'state/types'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import useWorkflowsEntrypoints from '../useWorkflowsEntrypoints'
import useWorkflowApi from '../useWorkflowApi'
import {
    WorkflowConfiguration,
    WorkflowStepMessages,
    WorkflowTransition,
} from '../../types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const renderHookOptions = {
    wrapper: (({children}: {children: ReactChildren}) => (
        <Provider store={mockStore({})}>{children}</Provider>
    )) as ComponentType,
}

const mockSelfServiceConfiguration: ReturnType<
    typeof useSelfServiceConfiguration
> = {
    isFetchPending: false,
    isUpdatePending: false,
    storeIntegration: undefined,
    selfServiceConfiguration: undefined,
    handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
} as const

const mockWorkflowConfiguration: WorkflowConfiguration = {
    id: 'a',
    account_id: 1,
    internal_id: 'int-a',
    name: 'a',
    is_draft: false,
    initial_step_id: 's1',
    steps: [] as WorkflowStepMessages[],
    transitions: [] as WorkflowTransition[],
}

const mockWorkflowApi: Partial<ReturnType<typeof useWorkflowApi>> = {
    isFetchPending: false,
    isUpdatePending: false,
    fetchWorkflowConfigurations: () => {
        return Promise.resolve([mockWorkflowConfiguration])
    },
    deleteWorkflowConfiguration: jest.fn(() => Promise.resolve()),
} as const

jest.mock('pages/automation/common/hooks/useSelfServiceConfiguration', () => {
    return {
        __esModule: true,
        default: jest.fn().mockReturnValue(mockSelfServiceConfiguration),
    }
})

jest.mock('pages/automation/workflows/hooks/useWorkflowApi.ts')

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
    ;(useWorkflowApi as jest.MockedFn<typeof useWorkflowApi>).mockReturnValue(
        mockWorkflowApi as ReturnType<typeof useWorkflowApi>
    )
}

const entrypointsFixtures = [
    {enabled: true, workflow_id: 'a', label: 'a'},
    {enabled: true, workflow_id: 'b', label: 'b'},
    {enabled: false, workflow_id: 'c', label: 'c'},
]
const entrypointsWithNameFixtures = entrypointsFixtures.map((entrypoint) => ({
    ...entrypoint,
    name: '',
}))

describe('useWorkflowsEntrypoints', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        updateMock({})
    })
    it('isFetchPending and isUpdatePending', () => {
        updateMock({
            isFetchPending: true,
            isUpdatePending: true,
        })
        const {result} = renderHook(
            () => useWorkflowsEntrypoints('', '', () => null),
            renderHookOptions
        )
        expect(result.current).toMatchObject({
            isFetchPending: true,
            isUpdatePending: true,
            workflowsEntrypoints: [],
        })
    })

    it('hydrates workflowsEntrypoints once configuration fetched', () => {
        const {result, rerender} = renderHook(
            () => useWorkflowsEntrypoints('', '', () => null),
            renderHookOptions
        )
        updateMock({
            selfServiceConfiguration: {
                workflows_entrypoints: entrypointsFixtures,
            } as SelfServiceConfiguration,
        })
        rerender()
        expect(result.current.workflowsEntrypoints).toEqual(
            entrypointsWithNameFixtures
        )
    })

    it('handleDragAndDrop', async () => {
        updateMock({
            selfServiceConfiguration: {
                workflows_entrypoints: entrypointsFixtures,
            } as SelfServiceConfiguration,
        })
        const {result} = renderHook(
            () => useWorkflowsEntrypoints('', '', () => null),
            renderHookOptions
        )
        await act(() => result.current.handleDragAndDrop(['c', 'a', 'b']))
        expect(result.current.workflowsEntrypoints).toEqual([
            entrypointsWithNameFixtures[2],
            {...entrypointsWithNameFixtures[0], name: 'a'},
            ...entrypointsWithNameFixtures.slice(1, 2),
        ])
    })

    it('deleteWorkflowEntrypoint', async () => {
        updateMock({
            selfServiceConfiguration: {
                workflows_entrypoints: entrypointsFixtures,
            } as SelfServiceConfiguration,
        })
        const {result} = renderHook(
            () => useWorkflowsEntrypoints('', '', () => null),
            renderHookOptions
        )
        await waitFor(() =>
            expect(result.current.isFetchPending).toEqual(false)
        )
        await act(() =>
            result.current.deleteWorkflowEntrypoint(
                mockWorkflowConfiguration.id
            )
        )
        expect(result.current.workflowsEntrypoints).toEqual([
            ...entrypointsWithNameFixtures.slice(1),
        ])
        expect(
            mockWorkflowApi.deleteWorkflowConfiguration
        ).toHaveBeenCalledTimes(1)
        expect(
            mockWorkflowApi.deleteWorkflowConfiguration
        ).toHaveBeenCalledWith(mockWorkflowConfiguration.internal_id)
    })

    it('toggleEnabled and isToggleUpdatePending', async () => {
        const configuration = {
            workflows_entrypoints: entrypointsFixtures,
        } as SelfServiceConfiguration
        updateMock({
            selfServiceConfiguration: configuration,
        })
        const {result, rerender} = renderHook(
            () => useWorkflowsEntrypoints('', '', () => null),
            renderHookOptions
        )
        await act(() => result.current.toggleEnabled('a'))
        expect(result.current.workflowsEntrypoints).toEqual([
            {...entrypointsFixtures[0], enabled: false, name: 'a'},
            ...entrypointsWithNameFixtures.slice(1),
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
        await act(() => result.current.toggleEnabled('a'))
        expect(result.current.workflowsEntrypoints).toEqual([
            {...entrypointsFixtures[0], name: 'a'},
            ...entrypointsWithNameFixtures.slice(1),
        ])
    })
})
