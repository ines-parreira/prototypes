import React, {ComponentType, ReactChildren} from 'react'
import {act, renderHook} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'
import {fromJS} from 'immutable'
import {waitFor} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {RootState, StoreDispatch} from 'state/types'
import {billingState} from 'fixtures/billing'
import {IntegrationType} from 'models/integration/constants'
import {
    useGetWorkflowConfigurations,
    useDuplicateWorkflowConfiguration,
    useDeleteWorkflowConfiguration,
} from 'models/workflows/queries'
import useWorkflowApi from '../useWorkflowApi'
import {useStoreWorkflowsApi} from '../useStoreWorkflowsApi'
import {
    getIntegration,
    mockWorkflowConfigurationShallow,
} from './fixtures/utils'
import {
    mockWorkflowApi,
    useSelfServiceConfigurationUpdateMockSetter,
} from './fixtures/mockBuilders'

jest.mock('pages/automate/common/hooks/useSelfServiceConfigurationUpdate')

jest.mock('state/entities/selfServiceConfigurations/selectors')
jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurations: jest.fn(),
    useDuplicateWorkflowConfiguration: jest.fn(),
    useDeleteWorkflowConfiguration: jest.fn(),
    workflowsConfigurationDefinitionKeys: {
        get: () => ['get'],
        lists: () => ['lists'],
    },
}))
const defaultState = {
    integrations: fromJS({
        integrations: [
            getIntegration(1, IntegrationType.Shopify),
            getIntegration(2, IntegrationType.Magento2),
        ],
    }),
    billing: fromJS(billingState),
} as RootState

const queryClient = mockQueryClient()

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const renderHookOptions = {
    wrapper: (({children}: {children: ReactChildren}) => (
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    )) as ComponentType,
}
jest.mock('pages/automate/workflows/hooks/useWorkflowApi.ts')
const useWorkflowApiMock = useWorkflowApi as jest.MockedFn<
    typeof useWorkflowApi
>

const mockedUseWorkflowConfigurations = jest.mocked(
    useGetWorkflowConfigurations
)

const mockedUseDuplicateWorkflowConfiguration = jest.mocked(
    useDuplicateWorkflowConfiguration
)
const mockedUseDeleteWorkflowConfiguration = jest.mocked(
    useDeleteWorkflowConfiguration
)
describe('useStoreWorkflowsApi', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        jest.spyOn(LD, 'useFlags').mockReturnValue({})
        mockedUseWorkflowConfigurations.mockReturnValue({
            isFetched: true,
            isLoading: false,
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)
        useSelfServiceConfigurationUpdateMockSetter({})

        useWorkflowApiMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            ...(mockWorkflowApi as any),
        })

        mockedUseDuplicateWorkflowConfiguration.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        } as unknown as ReturnType<typeof useDuplicateWorkflowConfiguration>)

        mockedUseDeleteWorkflowConfiguration.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        } as unknown as ReturnType<typeof useDeleteWorkflowConfiguration>)
    })

    it('should return the right default values', () => {
        const {result} = renderHook(
            () => useStoreWorkflowsApi(() => null),
            renderHookOptions
        )

        expect(result.current).toEqual({
            isUpdatePending: false,
            isFetchPending: false,
            duplicateWorkflow: expect.any(Function),
            removeWorkflowFromStore: expect.any(Function),
            appendWorkflowInStore: expect.any(Function),
            workflowConfigurationById: {},
        })
    })

    it('should invoke the right functions when calling duplicateWorkflow', async () => {
        const duplicateWorkflowConfigurationMock = jest
            .fn()
            .mockResolvedValue({data: {id: 4}})

        mockedUseDuplicateWorkflowConfiguration.mockReturnValue({
            mutateAsync: duplicateWorkflowConfigurationMock,
            isLoading: false,
        } as unknown as ReturnType<typeof useDuplicateWorkflowConfiguration>)

        const handleUpdateMock = jest.fn()

        useSelfServiceConfigurationUpdateMockSetter({
            handleSelfServiceConfigurationUpdate: handleUpdateMock,
        })

        const {result} = renderHook(
            () => useStoreWorkflowsApi(() => null),
            renderHookOptions
        )

        await act(async () => {
            const duplicatedWorkflow = await result.current.duplicateWorkflow(
                'workflow_id',
                14
            )

            expect(duplicateWorkflowConfigurationMock).toHaveBeenCalledWith([
                'workflow_id',
                {
                    integration_id: 14,
                },
            ])
            expect(mockedUseWorkflowConfigurations).toHaveBeenCalled()
            expect(handleUpdateMock).toHaveBeenCalled()
            expect(duplicatedWorkflow.id).toEqual(4)
        })
    })
    it('should invoke `deleteWorkflowConfiguration`', async () => {
        const deleteWorkflowConfigurationMock = jest.fn()

        mockedUseDeleteWorkflowConfiguration.mockReturnValue({
            mutateAsync: deleteWorkflowConfigurationMock,
            isLoading: false,
        } as unknown as ReturnType<typeof useDeleteWorkflowConfiguration>)

        mockedUseWorkflowConfigurations.mockReturnValue({
            isFetched: true,
            data: [
                mockWorkflowConfigurationShallow('a'),
                mockWorkflowConfigurationShallow('b'),
                mockWorkflowConfigurationShallow('c'),
            ],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        useSelfServiceConfigurationUpdateMockSetter({
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })

        const {result} = renderHook(
            () => useStoreWorkflowsApi(() => null),
            renderHookOptions
        )

        act(() => {
            result.current.removeWorkflowFromStore('a', 14).catch(() => null)
        })

        await waitFor(() => {
            expect(result.current.isUpdatePending).toBe(true)
        })
        await waitFor(() => {
            expect(result.current.isUpdatePending).toBe(false)
            expect(deleteWorkflowConfigurationMock).toHaveBeenCalledWith([
                'int-a',
            ])
        })
    })

    it('should invoke `appendWorkflowInStore`', async () => {
        useWorkflowApiMock.mockReturnValue({
            ...(mockWorkflowApi as any),
        })

        useSelfServiceConfigurationUpdateMockSetter({
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })

        const {result} = renderHook(
            () => useStoreWorkflowsApi(() => null),
            renderHookOptions
        )

        await act(async () => {
            await result.current.appendWorkflowInStore('a', 14)
            expect(mockedUseWorkflowConfigurations).toHaveBeenCalled()
        })
    })
})
