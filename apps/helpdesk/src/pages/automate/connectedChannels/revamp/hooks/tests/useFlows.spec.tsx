import type React from 'react'

import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { Provider } from 'react-redux'

import { getPrimaryLanguageFromChatConfig } from 'config/integrations/gorgias_chat'
import { useGetWorkflowConfigurations } from 'models/workflows/queries'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { mockStore } from 'utils/testing'

import { useFlows } from '../useFlows'

const mockHandleChatApplicationAutomationSettingsUpdate = jest.fn()

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration', () =>
    jest.fn(),
)

jest.mock('pages/automate/common/hooks/useSelfServiceChannels', () => jest.fn())

jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings', () =>
    jest.fn(),
)

jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurations: jest.fn(),
}))

jest.mock('config/integrations/gorgias_chat', () => ({
    getPrimaryLanguageFromChatConfig: jest.fn(),
}))

const mockedUseSelfServiceConfiguration =
    useSelfServiceConfiguration as jest.MockedFunction<
        typeof useSelfServiceConfiguration
    >

const mockedUseSelfServiceChannels =
    useSelfServiceChannels as jest.MockedFunction<typeof useSelfServiceChannels>

const mockedUseApplicationsAutomationSettings =
    useApplicationsAutomationSettings as jest.MockedFunction<
        typeof useApplicationsAutomationSettings
    >

const mockedUseGetWorkflowConfigurations =
    useGetWorkflowConfigurations as jest.MockedFunction<
        typeof useGetWorkflowConfigurations
    >

const mockedGetPrimaryLanguageFromChatConfig =
    getPrimaryLanguageFromChatConfig as jest.MockedFunction<
        typeof getPrimaryLanguageFromChatConfig
    >

const defaultParams = { shopName: 'test-shop', shopType: 'shopify' }

const mockChatChannel = {
    type: 'chat',
    value: { meta: { app_id: 'test-app-id' } },
} as any

const mockWorkflowEntrypoints = [{ id: 'flow-1' }] as any

describe('useFlows', () => {
    const store = mockStore({})

    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    )

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: {
                workflowsEntrypoints: mockWorkflowEntrypoints,
            },
            storeIntegration: { type: 'shopify', id: 1 },
            isFetchPending: false,
        } as any)

        mockedUseSelfServiceChannels.mockReturnValue([mockChatChannel])

        mockedUseApplicationsAutomationSettings.mockReturnValue({
            applicationsAutomationSettings: {
                'test-app-id': {
                    workflows: {
                        entrypoints: mockWorkflowEntrypoints,
                    },
                },
            },
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate:
                mockHandleChatApplicationAutomationSettingsUpdate,
        } as any)

        mockedUseGetWorkflowConfigurations.mockReturnValue({
            data: [],
        } as any)

        mockedGetPrimaryLanguageFromChatConfig.mockReturnValue('en')
    })

    it('should return the chat channel', () => {
        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        expect(result.current.channel).toEqual(mockChatChannel)
    })

    it('should return undefined channel when no chat channels exist', () => {
        mockedUseSelfServiceChannels.mockReturnValue([])

        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        expect(result.current.channel).toBeUndefined()
    })

    it('should return automationSettingsWorkflows from automation settings', () => {
        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        expect(result.current.automationSettingsWorkflows).toEqual(
            mockWorkflowEntrypoints,
        )
    })

    it('should return empty automationSettingsWorkflows when no chat channel', () => {
        mockedUseSelfServiceChannels.mockReturnValue([])

        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        expect(result.current.automationSettingsWorkflows).toEqual([])
    })

    it('should return workflowEntrypoints from self service configuration', () => {
        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        expect(result.current.workflowEntrypoints).toEqual(
            mockWorkflowEntrypoints,
        )
    })

    it('should return workflowConfigurations from useGetWorkflowConfigurations', () => {
        const mockConfigs = [{ id: 'config-1' }] as any
        mockedUseGetWorkflowConfigurations.mockReturnValue({
            data: mockConfigs,
        } as any)

        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        expect(result.current.workflowConfigurations).toEqual(mockConfigs)
    })

    it('should return primaryLanguage from chat config', () => {
        mockedGetPrimaryLanguageFromChatConfig.mockReturnValue('fr')

        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        expect(result.current.primaryLanguage).toBe('fr')
    })

    it('should return isLoading as true when self service configuration is loading', () => {
        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: true,
        } as any)

        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when automation settings are loading', () => {
        mockedUseApplicationsAutomationSettings.mockReturnValue({
            applicationsAutomationSettings: {},
            isFetchPending: true,
            handleChatApplicationAutomationSettingsUpdate:
                mockHandleChatApplicationAutomationSettingsUpdate,
        } as any)

        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when all data is loaded', () => {
        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(false)
    })

    it('should call handleChatApplicationAutomationSettingsUpdate with correct args when adding a flow', () => {
        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        act(() => {
            result.current.handleFlowAdd([{ id: 'flow-1' }] as any)
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                workflows: expect.objectContaining({
                    entrypoints: [{ id: 'flow-1' }],
                }),
            }),
            'Flow added',
        )
    })

    it('should call handleChatApplicationAutomationSettingsUpdate with correct args when removing a flow', () => {
        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        act(() => {
            result.current.handleFlowRemove([])
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                workflows: expect.objectContaining({ entrypoints: [] }),
            }),
            'Flow removed',
        )
    })

    it('should call handleChatApplicationAutomationSettingsUpdate with correct args when reordering flows', () => {
        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        act(() => {
            result.current.handleFlowReorder([
                { id: 'flow-2' },
                { id: 'flow-1' },
            ] as any)
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                workflows: expect.objectContaining({
                    entrypoints: [{ id: 'flow-2' }, { id: 'flow-1' }],
                }),
            }),
            'Flows order updated',
        )
    })

    it('should not call handleChatApplicationAutomationSettingsUpdate when no chat channel', () => {
        mockedUseSelfServiceChannels.mockReturnValue([])

        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        act(() => {
            result.current.handleFlowAdd([])
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).not.toHaveBeenCalled()
    })

    it('should not call handleChatApplicationAutomationSettingsUpdate when no automation settings for app', () => {
        mockedUseApplicationsAutomationSettings.mockReturnValue({
            applicationsAutomationSettings: {},
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate:
                mockHandleChatApplicationAutomationSettingsUpdate,
        } as any)

        const { result } = renderHook(() => useFlows(defaultParams), {
            wrapper,
        })

        act(() => {
            result.current.handleFlowAdd([])
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).not.toHaveBeenCalled()
    })
})
