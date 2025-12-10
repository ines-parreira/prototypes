import { assumeMock, renderHook } from '@repo/testing'

import { useGetAiAgentIntegrations } from 'hooks/aiAgent/useGetAiAgentIntegrations'
import type { AiAgentStoreConfigurationContextType } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))
const useAiAgentStoreConfigurationContextMock = assumeMock(
    useAiAgentStoreConfigurationContext,
)

describe('useGetAiAgentIntegrations', () => {
    const mockConfig = {
        storeConfiguration: {
            monitoredEmailIntegrations: [{ id: 'email1' }, { id: 'email2' }],
            monitoredChatIntegrations: ['chat1', 'chat2'],
            monitoredSmsIntegrations: ['sms1', 'sms2'],
        },
    } as unknown as AiAgentStoreConfigurationContextType

    beforeEach(() => {
        useAiAgentStoreConfigurationContextMock.mockReturnValue(mockConfig)
    })

    it('should return all integration ids including SMS', () => {
        const { result } = renderHook(() => useGetAiAgentIntegrations())
        expect(result.current).toEqual([
            { id: 'email1', channel: 'email' },
            { id: 'email2', channel: 'email' },
            { id: 'chat1', channel: 'chat' },
            { id: 'chat2', channel: 'chat' },
            { id: 'sms1', channel: 'sms' },
            { id: 'sms2', channel: 'sms' },
        ])
    })

    it('should return an empty array if there are no integrations', () => {
        useAiAgentStoreConfigurationContextMock.mockReturnValue({
            storeConfiguration: {
                monitoredEmailIntegrations: [],
                monitoredChatIntegrations: [],
                monitoredSmsIntegrations: [],
                previewModeActivatedDatetime: null,
                storeName: 'test',
                helpCenterId: 1,
            },
        } as unknown as AiAgentStoreConfigurationContextType)
        const { result } = renderHook(() => useGetAiAgentIntegrations())
        expect(result.current).toEqual([])
    })

    it('should handle only SMS integrations', () => {
        useAiAgentStoreConfigurationContextMock.mockReturnValue({
            storeConfiguration: {
                monitoredEmailIntegrations: [],
                monitoredChatIntegrations: [],
                monitoredSmsIntegrations: [100, 200],
                trialModeActivatedDatetime: null,
                previewModeActivatedDatetime: null,
                storeName: 'test',
                helpCenterId: 1,
            },
        } as unknown as AiAgentStoreConfigurationContextType)
        const { result } = renderHook(() => useGetAiAgentIntegrations())
        expect(result.current).toEqual([
            { id: 100, channel: 'sms' },
            { id: 200, channel: 'sms' },
        ])
    })

    it('should handle null SMS integrations array gracefully', () => {
        useAiAgentStoreConfigurationContextMock.mockReturnValue({
            storeConfiguration: {
                monitoredEmailIntegrations: [{ id: 1 }],
                monitoredChatIntegrations: [2],
                monitoredSmsIntegrations: null,
                trialModeActivatedDatetime: null,
                previewModeActivatedDatetime: null,
                storeName: 'test',
                helpCenterId: 1,
            },
        } as unknown as AiAgentStoreConfigurationContextType)
        const { result } = renderHook(() => useGetAiAgentIntegrations())
        expect(result.current).toEqual([
            { id: 1, channel: 'email' },
            { id: 2, channel: 'chat' },
        ])
    })

    it('should handle undefined SMS integrations array gracefully', () => {
        useAiAgentStoreConfigurationContextMock.mockReturnValue({
            storeConfiguration: {
                monitoredEmailIntegrations: [{ id: 1 }],
                monitoredChatIntegrations: [2],
                monitoredSmsIntegrations: undefined,
                trialModeActivatedDatetime: null,
                previewModeActivatedDatetime: null,
                storeName: 'test',
                helpCenterId: 1,
            },
        } as unknown as AiAgentStoreConfigurationContextType)
        const { result } = renderHook(() => useGetAiAgentIntegrations())
        expect(result.current).toEqual([
            { id: 1, channel: 'email' },
            { id: 2, channel: 'chat' },
        ])
    })
})
