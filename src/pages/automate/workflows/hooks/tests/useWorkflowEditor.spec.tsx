import {act, renderHook} from '@testing-library/react-hooks'
import React, {ReactChildren} from 'react'
import _noop from 'lodash/noop'
import {QueryClientProvider} from '@tanstack/react-query'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {
    useDownloadWorkflowConfigurationStepLogs,
    useGetWorkflowConfiguration,
    useUpsertWorkflowConfiguration,
    useFetchWorkflowConfiguration,
    useFetchWorkflowConfigurationTranslations,
    useDeleteWorkflowConfigurationTranslations,
    useUpsertWorkflowConfigurationTranslations,
} from 'models/workflows/queries'
import {useWorkflowEditor} from '../useWorkflowEditor'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('models/workflows/queries', () => ({
    useDownloadWorkflowConfigurationStepLogs: jest.fn(),
    useGetWorkflowConfiguration: jest.fn(),
    useUpsertWorkflowConfiguration: jest.fn(),
    useFetchWorkflowConfiguration: jest.fn(),
    useFetchWorkflowConfigurationTranslations: jest.fn(),
    useDeleteWorkflowConfigurationTranslations: jest.fn(),
    useUpsertWorkflowConfigurationTranslations: jest.fn(),
    workflowsConfigurationDefinitionKeys: {
        get: () => ['get'],
        lists: () => ['list'],
    },
}))
const mockedUseDownloadWorkflowConfigurationStepLogs = jest.mocked(
    useDownloadWorkflowConfigurationStepLogs
)
const mockedUseGetWorkflowConfiguration = jest.mocked(
    useGetWorkflowConfiguration
)

const mockedUseUpsertWorkflowConfiguration = jest.mocked(
    useUpsertWorkflowConfiguration
)

const mockUseFetchWorkflowConfiguration = jest.mocked(
    useFetchWorkflowConfiguration
)

const mockedUseFetchWorkflowConfigurationTranslations = jest.mocked(
    useFetchWorkflowConfigurationTranslations
)
const mockedUseDeleteWorkflowConfigurationTranslations = jest.mocked(
    useDeleteWorkflowConfigurationTranslations
)
const mocedkUseUpsertWorkflowConfigurationTranslations = jest.mocked(
    useUpsertWorkflowConfigurationTranslations
)
const queryClient = mockQueryClient()

function updateMock() {
    const mockSelfServiceConfiguration: ReturnType<
        typeof useSelfServiceConfiguration
    > = {
        isFetchPending: false,
        isUpdatePending: false,
        storeIntegration: undefined,
        selfServiceConfiguration: undefined,
        handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
    } as const

    ;(
        useSelfServiceConfiguration as jest.MockedFn<
            typeof useSelfServiceConfiguration
        >
    ).mockReturnValue(mockSelfServiceConfiguration)
    mockedUseDownloadWorkflowConfigurationStepLogs.mockReturnValue({
        isLoading: false,
        data: [],
    } as unknown as ReturnType<typeof useDownloadWorkflowConfigurationStepLogs>)
    mockedUseGetWorkflowConfiguration.mockReturnValue({
        isFetching: false,
        isRefetching: false,
        isFetched: true,
        data: [],
    } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)
    mockUseFetchWorkflowConfiguration.mockReturnValue({
        mutateAsync: jest.fn(),
        isLoading: false,
    } as unknown as ReturnType<typeof useFetchWorkflowConfiguration>)
    mockedUseUpsertWorkflowConfiguration.mockReturnValue({
        mutateAsync: jest.fn(),
    } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)
    mockedUseFetchWorkflowConfigurationTranslations.mockReturnValue({
        mutateAsync: jest.fn().mockResolvedValue({
            data: {},
        }),
    } as unknown as ReturnType<typeof useFetchWorkflowConfigurationTranslations>)
    mockedUseDeleteWorkflowConfigurationTranslations.mockReturnValue({
        mutateAsync: jest.fn(),
    } as unknown as ReturnType<typeof useDeleteWorkflowConfigurationTranslations>)
    mocedkUseUpsertWorkflowConfigurationTranslations.mockReturnValue({
        mutateAsync: jest.fn().mockResolvedValue({
            data: {},
        }),
    } as unknown as ReturnType<typeof useUpsertWorkflowConfigurationTranslations>)
}

const renderHookOptions = {
    wrapper: ({children}: {children: ReactChildren}) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    ),
}

describe('useWorkflowEditor', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        updateMock()
    })
    it('generates an empty workflow configuration when is new', () => {
        const {result} = renderHook(
            () => useWorkflowEditor(1, 'a', true, _noop),
            renderHookOptions
        )
        expect(result.current.configuration.name).toEqual('')
    })

    it('should be a draft when is new', () => {
        const {result} = renderHook(
            () => useWorkflowEditor(1, 'a', true, _noop),
            renderHookOptions
        )
        expect(result.current.configuration.is_draft).toBe(true)
    })

    it('should be a draft when saved but not published', async () => {
        const initialConfiguration = {
            id: 'a',
            internal_id: 'int-a',
            account_id: 1,
            is_draft: true,
            name: 'remote name',
            initial_step_id: 'message1',
            entrypoint: {
                label: 'entrypoint',
                label_tkey: 'entrypoint',
            },
            steps: [
                {
                    id: 'message1',
                    kind: 'message',
                    settings: {
                        message: {
                            content: {
                                text: 'Hello',
                                html: '<p>Hello</p>',
                                text_tkey: 'Hello',
                                html_tkey: '<p>Hello</p>',
                            },
                        },
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
                    id: 'message1-handover1',
                    from_step_id: 'message1',
                    to_step_id: 'handover1',
                },
            ],
        }

        mockUseFetchWorkflowConfiguration.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({
                data: initialConfiguration,
            }),
            isLoading: false,
        } as unknown as ReturnType<typeof useFetchWorkflowConfiguration>)

        mockedUseUpsertWorkflowConfiguration.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({
                data: initialConfiguration,
            }),
        } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

        const {result, waitForNextUpdate} = renderHook(
            () => useWorkflowEditor(1, 'a', false, _noop),
            renderHookOptions
        )
        await waitForNextUpdate()
        expect(result.current.configuration.is_draft).toBe(true)

        // save
        act(() => void result.current.handleSave())
        await waitForNextUpdate()
        expect(result.current.configuration.is_draft).toBe(true)

        // publish
        act(() => void result.current.handlePublish())
        await waitForNextUpdate()
        expect(result.current.configuration.is_draft).toBe(false)
    })

    it('reflects changes on workflow name', async () => {
        const initialConfiguration = {
            id: 'a',
            internal_id: 'int-a',
            account_id: 1,
            is_draft: false,
            name: 'remote name',
            initial_step_id: 'message1',
            entrypoint: {
                label: 'entrypoint',
                label_tkey: 'entrypoint',
            },
            steps: [
                {
                    id: 'message1',
                    kind: 'message',
                    settings: {
                        message: {
                            content: {
                                text: 'Hello',
                                html: '<p>Hello</p>',
                                text_tkey: 'Hello',
                                html_tkey: '<p>Hello</p>',
                            },
                        },
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
                    id: 'message1-handover1',
                    from_step_id: 'message1',
                    to_step_id: 'handover1',
                },
            ],
        }

        mockUseFetchWorkflowConfiguration.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({
                data: initialConfiguration,
            }),
            isLoading: false,
        } as unknown as ReturnType<typeof useFetchWorkflowConfiguration>)

        mockedUseUpsertWorkflowConfiguration.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({
                data: {},
            }),
        } as unknown as ReturnType<typeof useUpsertWorkflowConfiguration>)

        const {result, waitForNextUpdate, rerender} = renderHook(
            () => useWorkflowEditor(1, 'a', false, _noop),
            renderHookOptions
        )
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
