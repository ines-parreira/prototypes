import {useEffect, useState} from 'react'
import {
    fetchChatHelpCenterConfiguration,
    ChatHelpCenterConfiguration,
} from 'models/selfServiceConfiguration/resources'

export const useChatHelpCenterConfiguration = (chatApplicationId: string) => {
    const [chatHelpCenterConfiguration, setChatHelpCenterConfiguration] =
        useState<ChatHelpCenterConfiguration | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchChatHelpCenterConfiguration(
                chatApplicationId
            )
            setChatHelpCenterConfiguration(data)
        }

        void fetchData()
    }, [chatApplicationId])

    return {chatHelpCenterConfiguration, setChatHelpCenterConfiguration}
}
