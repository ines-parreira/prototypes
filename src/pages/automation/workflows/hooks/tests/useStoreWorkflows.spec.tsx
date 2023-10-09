import React, {ComponentType, ReactChildren} from 'react'
import {act, renderHook} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {waitFor} from '@testing-library/react'
import {RootState, StoreDispatch} from 'state/types'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import useStoreWorkflows from '../useStoreWorkflows'
import useWorkflowApi from '../useWorkflowApi'
import {
    WorkflowConfiguration,
    WorkflowStepMessages,
    WorkflowTransition,
} from '../../models/workflowConfiguration.types'

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

function mockWorkflowConfiguration(uid: string): WorkflowConfiguration {
    return {
        id: uid,
        account_id: 1,
        internal_id: `int-${uid}`,
        name: uid,
        is_draft: false,
        initial_step_id: 's1',
        steps: [] as WorkflowStepMessages[],
        transitions: [] as WorkflowTransition[],
        available_languages: [],
    }
}

const mockWorkflowApi: Partial<ReturnType<typeof useWorkflowApi>> = {
    isFetchPending: false,
    isUpdatePending: false,
    fetchWorkflowConfigurations: () => {
        return Promise.resolve([
            mockWorkflowConfiguration('a'),
            mockWorkflowConfiguration('b'),
            mockWorkflowConfiguration('c'),
        ])
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
    {workflow_id: 'a'},
    {workflow_id: 'b'},
    {workflow_id: 'c'},
]
const entrypointsWithNameFixtures = entrypointsFixtures.map((entrypoint) => ({
    ...entrypoint,
    name: entrypoint.workflow_id,
    available_languages: [],
}))

describe('useStoreWorkflows', () => {
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
            () => useStoreWorkflows('', '', () => null),
            renderHookOptions
        )
        expect(result.current).toMatchObject({
            isFetchPending: true,
            isUpdatePending: true,
            storeWorkflows: [],
        })
    })

    it('hydrates storeWorkflows once configuration fetched', async () => {
        const {result, rerender} = renderHook(
            () => useStoreWorkflows('', '', () => null),
            renderHookOptions
        )
        updateMock({
            selfServiceConfiguration: {
                workflows_entrypoints: entrypointsFixtures,
            } as SelfServiceConfiguration,
        })
        await waitFor(() =>
            expect(result.current.isFetchPending).toEqual(false)
        )
        rerender()
        expect(result.current.storeWorkflows).toEqual(
            entrypointsWithNameFixtures
        )
    })

    it('deleteWorkflowEntrypoint', async () => {
        const selfServiceConfiguration = {
            workflows_entrypoints: [...entrypointsFixtures],
        } as SelfServiceConfiguration

        const handleSelfServiceConfigurationUpdateMock = jest
            .fn()
            .mockImplementation(
                (
                    patchSelfServiceConfiguration: (
                        draft: SelfServiceConfiguration
                    ) => void
                ) => {
                    patchSelfServiceConfiguration(selfServiceConfiguration)
                }
            )

        updateMock({
            selfServiceConfiguration,
            handleSelfServiceConfigurationUpdate:
                handleSelfServiceConfigurationUpdateMock,
        })
        const {result} = renderHook(
            () => useStoreWorkflows('', '', () => null),
            renderHookOptions
        )
        await waitFor(() =>
            expect(result.current.isFetchPending).toEqual(false)
        )
        await act(() =>
            result.current.removeWorkflowFromStore(
                mockWorkflowConfiguration('a').id
            )
        )
        expect(selfServiceConfiguration.workflows_entrypoints).toEqual(
            entrypointsFixtures.slice(1)
        )
        expect(
            mockWorkflowApi.deleteWorkflowConfiguration
        ).toHaveBeenCalledTimes(1)
        expect(
            mockWorkflowApi.deleteWorkflowConfiguration
        ).toHaveBeenCalledWith(mockWorkflowConfiguration('a').internal_id)
    })

    it('appendWorkflowInStore', async () => {
        const selfServiceConfiguration = {
            workflows_entrypoints: [...entrypointsFixtures],
        } as SelfServiceConfiguration

        const handleSelfServiceConfigurationUpdateMock = jest
            .fn()
            .mockImplementation(
                (
                    patchSelfServiceConfiguration: (
                        draft: SelfServiceConfiguration
                    ) => void
                ) => {
                    patchSelfServiceConfiguration(selfServiceConfiguration)
                }
            )

        updateMock({
            selfServiceConfiguration,
            handleSelfServiceConfigurationUpdate:
                handleSelfServiceConfigurationUpdateMock,
        })
        const {result} = renderHook(
            () => useStoreWorkflows('', '', () => null),
            renderHookOptions
        )
        await waitFor(() =>
            expect(result.current.isFetchPending).toEqual(false)
        )
        await act(() => result.current.appendWorkflowInStore('z'))
        expect(selfServiceConfiguration.workflows_entrypoints).toEqual([
            ...entrypointsFixtures,
            {workflow_id: 'z'},
        ])

        // doesn’t append duplicate workflow
        await act(() => result.current.appendWorkflowInStore('c'))
        expect(selfServiceConfiguration.workflows_entrypoints).toEqual([
            ...entrypointsFixtures,
            {workflow_id: 'z'},
        ])
    })
})
