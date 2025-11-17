import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import {
    getAvailableChats,
    getFirstAvailableChat,
} from '../handoverCustomizationChatSettingsComponent.utils'

describe('handoverCustomizationChatSettingsComponent.utils', () => {
    const mockChatChannels = [
        {
            value: { id: 1, name: 'Chat 1' },
        },
        {
            value: { id: 2, name: 'Chat 2' },
        },
        {
            value: { id: 3, name: 'Chat 3' },
        },
        {
            value: { id: 4, name: 'Chat 4' },
        },
        {
            value: { id: 5, name: 'Chat 5' },
        },
    ] as SelfServiceChatChannel[]

    describe('getAvailableChats', () => {
        it('should return empty array when monitored chat integrations is null', () => {
            const result = getAvailableChats({
                chatChannels: mockChatChannels,
                monitoredChatIntegrationIds: null,
            })
            expect(result).toEqual([])
        })

        it('should return empty array when monitored chat integrations is empty', () => {
            const result = getAvailableChats({
                chatChannels: mockChatChannels,
                monitoredChatIntegrationIds: [],
            })
            expect(result).toEqual([])
        })

        it('should return filtered chats based on monitored chat integrations', () => {
            const result = getAvailableChats({
                chatChannels: mockChatChannels,
                monitoredChatIntegrationIds: [1, 3],
            })
            expect(result).toHaveLength(2)
            expect(result).toEqual([
                {
                    value: { id: 1, name: 'Chat 1' },
                },
                {
                    value: { id: 3, name: 'Chat 3' },
                },
            ])
        })

        it('should return emppty array when there are no matching chats', () => {
            const result = getAvailableChats({
                chatChannels: mockChatChannels,
                monitoredChatIntegrationIds: [6, 7],
            })
            expect(result).toEqual([])
        })
    })

    describe('getFirstAvailableChat', () => {
        it('should return undefined when monitored chat integrations is null', () => {
            const result = getFirstAvailableChat({
                chatChannels: mockChatChannels,
                monitoredChatIntegrationIds: null,
            })
            expect(result).toBeUndefined()
        })

        it('should return undefined when monitored chat integrations is empty', () => {
            const result = getFirstAvailableChat({
                chatChannels: mockChatChannels,
                monitoredChatIntegrationIds: [],
            })
            expect(result).toBeUndefined()
        })

        it('should return first matching chat id from monitored chat integrations', () => {
            const result = getFirstAvailableChat({
                chatChannels: mockChatChannels,
                monitoredChatIntegrationIds: [2, 1],
            })
            expect(result).toEqual({
                value: { id: 2, name: 'Chat 2' },
            })
        })

        it('should return undefined when there is no matching chat', () => {
            const result = getFirstAvailableChat({
                chatChannels: mockChatChannels,
                monitoredChatIntegrationIds: [8, 9],
            })
            expect(result).toBeUndefined()
        })

        it('should handle empty chatChannels array', () => {
            const result = getFirstAvailableChat({
                chatChannels: [],
                monitoredChatIntegrationIds: [1, 2],
            })
            expect(result).toBeUndefined()
        })

        it('should keep the order of monitored chat integrations when finding first match', () => {
            const result = getFirstAvailableChat({
                chatChannels: mockChatChannels,
                monitoredChatIntegrationIds: [3, 1, 2],
            })
            expect(result).toEqual({
                value: { id: 3, name: 'Chat 3' },
            })
        })
    })
})
