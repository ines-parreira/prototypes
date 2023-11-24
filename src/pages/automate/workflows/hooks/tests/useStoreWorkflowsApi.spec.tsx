import React, {ComponentType, ReactChildren} from 'react'
import {act, renderHook} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {waitFor} from '@testing-library/react'
import {RootState, StoreDispatch} from 'state/types'
import {billingState} from 'fixtures/billing'
import {IntegrationType} from 'models/integration/constants'
import {getSelfServiceConfigurations} from 'state/entities/selfServiceConfigurations/selectors'
import useWorkflowApi from '../useWorkflowApi'
import {useStoreWorkflowsApi} from '../useStoreWorkflowsApi'
import {getIntegration} from './fixtures/utils'
import {
    mockSelfServiceConfigurationUpdate,
    mockWorkflowApi,
    useSelfServiceConfigurationUpdateMockSetter,
} from './fixtures/mockBuilders'

jest.mock('pages/automate/common/hooks/useSelfServiceConfigurationUpdate')
jest.mock('state/entities/selfServiceConfigurations/selectors')

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
jest.mock('state/entities/selfServiceConfigurations/selectors', () => {
    return {
        __esModule: true,
        getSelfServiceConfigurations: jest.fn(() => [
            {
                id: 1,
                type: 'ShopType',
                shop_name: 'ShopName',
                created_datetime: '2021-03-31T14:00:00.000Z',
                updated_datetime: '2021-03-31T14:00:00.000Z',
                quick_response_policies: [],
                workflows_entrypoints: [],
            },
        ]),
    }
})

jest.mock(
    'pages/automate/common/hooks/useSelfServiceConfigurationUpdate',
    () => {
        return {
            __esModule: true,
            useSelfServiceConfigurationUpdate: jest.fn(
                () => mockSelfServiceConfigurationUpdate
            ),
        }
    }
)

const useWorkflowApiMock = useWorkflowApi as jest.MockedFn<
    typeof useWorkflowApi
>

describe('useStoreWorkflowsApi', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useSelfServiceConfigurationUpdateMockSetter({})
        ;(
            getSelfServiceConfigurations as jest.MockedFn<
                typeof getSelfServiceConfigurations
            >
        ).mockReturnValue([
            {
                id: 1,
                type: 'ShopType' as any,
                shop_name: 'ShopName',
                created_datetime: '2021-03-31T14:00:00.000Z',
                updated_datetime: '2021-03-31T14:00:00.000Z',
                quick_response_policies: [],
                workflows_entrypoints: [],
            },
        ] as unknown as ReturnType<typeof getSelfServiceConfigurations>)
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
        const fetchWorkflowsMock = jest
            .fn()
            .mockResolvedValue(mockWorkflowApi.fetchWorkflowConfigurations?.())
        const handleUpdateMock = jest.fn()

        useSelfServiceConfigurationUpdateMockSetter({
            handleSelfServiceConfigurationUpdate: handleUpdateMock,
        })
        useWorkflowApiMock.mockReturnValue({
            ...(mockWorkflowApi as any),
            duplicateWorkflowConfiguration: duplicateWorkflowConfigurationMock,
            fetchWorkflowConfigurations: fetchWorkflowsMock,
        })

        const {waitForNextUpdate, result} = renderHook(
            () => useStoreWorkflowsApi(() => null),
            renderHookOptions
        )

        await waitForNextUpdate()

        await act(async () => {
            const duplicatedWorkflow = await result.current.duplicateWorkflow(
                'workflow_id',
                14
            )

            expect(duplicateWorkflowConfigurationMock).toHaveBeenCalledWith(
                'workflow_id'
            )
            expect(fetchWorkflowsMock).toHaveBeenCalled()
            expect(handleUpdateMock).toHaveBeenCalled()
            expect(duplicatedWorkflow.id).toEqual(4)
        })
    })
    it('should invoke `deleteWorkflowConfiguration`', async () => {
        const deleteWorkflowConfigurationMock = jest
            .fn()
            .mockResolvedValue({id: 4})

        const fetchWorkflowsMock = jest
            .fn()
            .mockResolvedValue(mockWorkflowApi.fetchWorkflowConfigurations?.())

        useWorkflowApiMock.mockReturnValue({
            ...(mockWorkflowApi as any),
            fetchWorkflowConfigurations: fetchWorkflowsMock,
            deleteWorkflowConfiguration: deleteWorkflowConfigurationMock,
        })

        useSelfServiceConfigurationUpdateMockSetter({
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })

        const {result, waitForNextUpdate} = renderHook(
            () => useStoreWorkflowsApi(() => null),
            renderHookOptions
        )

        await waitForNextUpdate()
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
        const fetchWorkflowsMock = jest
            .fn()
            .mockResolvedValue(mockWorkflowApi.fetchWorkflowConfigurations?.())

        useWorkflowApiMock.mockReturnValue({
            ...(mockWorkflowApi as any),
            fetchWorkflowConfigurations: fetchWorkflowsMock,
        })

        useSelfServiceConfigurationUpdateMockSetter({
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })

        const {result, waitForNextUpdate} = renderHook(
            () => useStoreWorkflowsApi(() => null),
            renderHookOptions
        )

        await waitForNextUpdate()
        await act(async () => {
            await result.current.appendWorkflowInStore('a', 14)
            expect(fetchWorkflowsMock).toHaveBeenCalled()
        })
    })
})
