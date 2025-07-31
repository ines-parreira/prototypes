import { renderHook } from '@repo/testing'

import { useGetAiAgentIntegrations } from 'hooks/aiAgent/useGetAiAgentIntegrations'
import {
    AiAgentStoreConfigurationContextType,
    useAiAgentStoreConfigurationContext,
} from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { assumeMock } from 'utils/testing'

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
        },
    } as unknown as AiAgentStoreConfigurationContextType

    beforeEach(() => {
        useAiAgentStoreConfigurationContextMock.mockReturnValue(mockConfig)
    })

    it('should return all integration ids', () => {
        const { result } = renderHook(() => useGetAiAgentIntegrations())
        expect(result.current).toEqual([
            { id: 'email1', channel: 'email' },
            { id: 'email2', channel: 'email' },
            { id: 'chat1', channel: 'chat' },
            { id: 'chat2', channel: 'chat' },
        ])
    })

    it('should return an empty array if there are no integrations', () => {
        useAiAgentStoreConfigurationContextMock.mockReturnValue({
            storeConfiguration: {
                monitoredEmailIntegrations: [],
                monitoredChatIntegrations: [],
                trialModeActivatedDatetime: null,
                previewModeActivatedDatetime: null,
                storeName: 'test',
                helpCenterId: 1,
            },
        } as unknown as AiAgentStoreConfigurationContextType)
        const { result } = renderHook(() => useGetAiAgentIntegrations())
        expect(result.current).toEqual([])
    })
})
