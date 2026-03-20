import type React from 'react'

import { act, renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { TicketChannel } from 'business/types/ticket'
import { useGetWorkflowConfigurations } from 'models/workflows/queries'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { mockStore } from 'utils/testing'

import { useFlows } from '../useFlows'

const mockHandleChatApplicationAutomationSettingsUpdate = jest.fn()

jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings', () =>
    jest.fn(),
)

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration', () =>
    jest.fn(),
)

jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurations: jest.fn(),
}))

const mockedUseApplicationsAutomationSettings =
    useApplicationsAutomationSettings as jest.MockedFunction<
        typeof useApplicationsAutomationSettings
    >

const mockedUseSelfServiceConfiguration =
    useSelfServiceConfiguration as jest.MockedFunction<
        typeof useSelfServiceConfiguration
    >

const mockedUseGetWorkflowConfigurations =
    useGetWorkflowConfigurations as jest.MockedFunction<
        typeof useGetWorkflowConfigurations
    >

describe('useFlows', () => {
    const defaultIntegration = fromJS({
        id: 1,
        name: 'Test Chat',
        meta: {
            app_id: 'test-app-id',
            shop_name: 'test-shop',
            shop_type: 'shopify',
        },
    })

    const store = mockStore({})

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>
            <MemoryRouter>{children}</MemoryRouter>
        </Provider>
    )

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: {
                workflowsEntrypoints: [{ workflow_id: 'workflow-1' }],
            },
            storeIntegration: null,
            isFetchPending: false,
        } as any)

        mockedUseGetWorkflowConfigurations.mockReturnValue({
            data: [{ id: 'workflow-1', name: 'Test Workflow' }],
        } as any)

        mockedUseApplicationsAutomationSettings.mockReturnValue({
            applicationsAutomationSettings: {
                'test-app-id': {
                    applicationId: 'test-app-id',
                    articleRecommendation: { enabled: false },
                    orderManagement: { enabled: false },
                    workflows: {
                        enabled: true,
                        entrypoints: [
                            { workflow_id: 'workflow-1', enabled: true },
                        ],
                    },
                },
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleChatApplicationAutomationSettingsUpdate:
                mockHandleChatApplicationAutomationSettingsUpdate,
        } as any)
    })

    it('should return automationSettingsWorkflows from automation settings', () => {
        const { result } = renderHook(
            () => useFlows({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.automationSettingsWorkflows).toEqual([
            { workflow_id: 'workflow-1', enabled: true },
        ])
    })

    it('should return empty automationSettingsWorkflows when appId is missing', () => {
        const integrationWithoutAppId = fromJS({
            id: 1,
            meta: {
                shop_name: 'test-shop',
                shop_type: 'shopify',
            },
        })

        const { result } = renderHook(
            () => useFlows({ integration: integrationWithoutAppId }),
            { wrapper },
        )

        expect(result.current.automationSettingsWorkflows).toEqual([])
    })

    it('should return workflowEntrypoints from selfServiceConfiguration', () => {
        const { result } = renderHook(
            () => useFlows({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.workflowEntrypoints).toEqual([
            { workflow_id: 'workflow-1' },
        ])
    })

    it('should return workflowConfigurations from query', () => {
        const { result } = renderHook(
            () => useFlows({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.workflowConfigurations).toEqual([
            { id: 'workflow-1', name: 'Test Workflow' },
        ])
    })

    it('should return channel with correct type', () => {
        const { result } = renderHook(
            () => useFlows({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.channel.type).toBe(TicketChannel.Chat)
    })

    it('should return shopName and shopType from integration', () => {
        const { result } = renderHook(
            () => useFlows({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.shopName).toBe('test-shop')
        expect(result.current.shopType).toBe('shopify')
    })

    it('should return isLoading as true when selfServiceConfiguration is loading', () => {
        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: true,
        } as any)

        const { result } = renderHook(
            () => useFlows({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when automation settings are loading', () => {
        mockedUseApplicationsAutomationSettings.mockReturnValue({
            applicationsAutomationSettings: {},
            isFetchPending: true,
            isUpdatePending: false,
            handleChatApplicationAutomationSettingsUpdate:
                mockHandleChatApplicationAutomationSettingsUpdate,
        } as any)

        const { result } = renderHook(
            () => useFlows({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when all data is loaded', () => {
        const { result } = renderHook(
            () => useFlows({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should call handleChatApplicationAutomationSettingsUpdate when handleFlowsChange is called with add action', () => {
        const { result } = renderHook(
            () => useFlows({ integration: defaultIntegration }),
            { wrapper },
        )

        act(() => {
            result.current.handleFlowsChange(
                [{ workflow_id: 'workflow-2', enabled: true }],
                'add',
            )
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                workflows: expect.objectContaining({
                    entrypoints: [{ workflow_id: 'workflow-2', enabled: true }],
                }),
            }),
            'Flow added',
        )
    })

    it('should call handleChatApplicationAutomationSettingsUpdate when handleFlowsChange is called with remove action', () => {
        const { result } = renderHook(
            () => useFlows({ integration: defaultIntegration }),
            { wrapper },
        )

        act(() => {
            result.current.handleFlowsChange([], 'remove')
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                workflows: expect.objectContaining({
                    entrypoints: [],
                }),
            }),
            'Flow removed',
        )
    })

    it('should call handleChatApplicationAutomationSettingsUpdate when handleFlowsChange is called with reorder action', () => {
        const { result } = renderHook(
            () => useFlows({ integration: defaultIntegration }),
            { wrapper },
        )

        act(() => {
            result.current.handleFlowsChange(
                [
                    { workflow_id: 'workflow-2', enabled: true },
                    { workflow_id: 'workflow-1', enabled: true },
                ],
                'reorder',
            )
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                workflows: expect.objectContaining({
                    entrypoints: [
                        { workflow_id: 'workflow-2', enabled: true },
                        { workflow_id: 'workflow-1', enabled: true },
                    ],
                }),
            }),
            'Flows order updated',
        )
    })

    it('should not call handleChatApplicationAutomationSettingsUpdate when appId is missing', () => {
        const integrationWithoutAppId = fromJS({
            id: 1,
            meta: {
                shop_name: 'test-shop',
                shop_type: 'shopify',
            },
        })

        const { result } = renderHook(
            () => useFlows({ integration: integrationWithoutAppId }),
            { wrapper },
        )

        act(() => {
            result.current.handleFlowsChange(
                [{ workflow_id: 'workflow-1', enabled: true }],
                'add',
            )
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).not.toHaveBeenCalled()
    })
})
