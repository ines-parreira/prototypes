import MockAdapter from 'axios-mock-adapter'
import {renderHook} from '@testing-library/react-hooks'

import {waitFor} from '@testing-library/react'
import {useChatHelpCenterConfiguration} from '../hooks'
import client from '../../../../../../../models/api/resources'

const mockChatHelpCenterConfiguration = {
    chat_application_id: 1,
    enabled: true,
    help_center_id: 2,
    id: 2,
}

describe('useChatHelpCenterConfiguration()', () => {
    const mockServer = new MockAdapter(client)

    beforeEach(() => {
        mockServer.reset()
        jest.clearAllMocks()
        mockServer
            .onGet('/api/chat_help_center/1')
            .reply(200, mockChatHelpCenterConfiguration)
    })

    it('should return null if no chat application id provided', () => {
        const {result} = renderHook(() => {
            return useChatHelpCenterConfiguration(null)
        })

        expect(result.current.chatHelpCenterConfiguration).toBeNull()
    })

    it('should return the chat help center configuration if chat application id provided', async () => {
        const {result} = renderHook(() => {
            return useChatHelpCenterConfiguration(1)
        })

        await waitFor(() => {
            expect(result.current.chatHelpCenterConfiguration).toStrictEqual(
                mockChatHelpCenterConfiguration
            )
        })
    })

    it('should return null if there was an error fetching chat help center configuration', async () => {
        let chatApplicationId = 1

        const {result, rerender} = renderHook(() => {
            return useChatHelpCenterConfiguration(chatApplicationId)
        })

        await waitFor(() => {
            expect(result.current.chatHelpCenterConfiguration).toStrictEqual(
                mockChatHelpCenterConfiguration
            )
        })

        chatApplicationId = 2
        rerender()

        await waitFor(() => {
            expect(result.current.chatHelpCenterConfiguration).toBeNull()
        })
    })
})
