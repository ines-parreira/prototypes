import React, {ComponentType, ReactChildren} from 'react'
import {act, renderHook} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {waitFor} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'

import {RootState, StoreDispatch} from 'state/types'
import {billingState} from 'fixtures/billing'
import {IntegrationType} from 'models/integration/constants'
import {useGetWorkflowConfigurations} from 'models/workflows/queries'
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

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const renderHookOptions = {
    wrapper: (({children}: {children: ReactChildren}) => (
        <Provider store={mockStore(defaultState)}>{children}</Provider>
    )) as ComponentType,
}
jest.mock('pages/automate/workflows/hooks/useWorkflowApi.ts')
const useWorkflowApiMock = useWorkflowApi as jest.MockedFn<
    typeof useWorkflowApi
>

const mockedUseWorkflowConfigurations = jest.mocked(
    useGetWorkflowConfigurations
)
describe('useStoreWorkflowsApi', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        jest.spyOn(LD, 'useFlags').mockReturnValue({})
        mockedUseWorkflowConfigurations.mockReturnValue({
            isLoading: false,
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)
        useSelfServiceConfigurationUpdateMockSetter({})

        useWorkflowApiMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            ...(mockWorkflowApi as any),
        })
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
            .mockResolvedValue({id: 4})

        mockedUseWorkflowConfigurations.mockReturnValue({
            isLoading: false,
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        const handleUpdateMock = jest.fn()

        useSelfServiceConfigurationUpdateMockSetter({
            handleSelfServiceConfigurationUpdate: handleUpdateMock,
        })
        useWorkflowApiMock.mockReturnValue({
            ...(mockWorkflowApi as any),
            duplicateWorkflowConfiguration: duplicateWorkflowConfigurationMock,
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

            expect(duplicateWorkflowConfigurationMock).toHaveBeenCalledWith(
                'workflow_id',
                14
            )
            expect(mockedUseWorkflowConfigurations).toHaveBeenCalled()
            expect(handleUpdateMock).toHaveBeenCalled()
            expect(duplicatedWorkflow.id).toEqual(4)
        })
    })
    it('should invoke `deleteWorkflowConfiguration`', async () => {
        const deleteWorkflowConfigurationMock = jest
            .fn()
            .mockResolvedValue({id: 4})
        mockedUseWorkflowConfigurations.mockReturnValue({
            isLoading: false,
            data: [
                mockWorkflowConfigurationShallow('a'),
                mockWorkflowConfigurationShallow('b'),
                mockWorkflowConfigurationShallow('c'),
            ],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        jest.mocked(useGetWorkflowConfigurations)

        useWorkflowApiMock.mockReturnValue({
            ...(mockWorkflowApi as any),

            deleteWorkflowConfiguration: deleteWorkflowConfigurationMock,
        })

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
            expect(deleteWorkflowConfigurationMock).toHaveBeenCalledWith(
                'int-a'
            )
        })
    })

    it('should invoke `appendWorkflowInStore`', async () => {
        const mockedUseWorkflowConfigurations = jest.mocked(
            useGetWorkflowConfigurations
        )

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
