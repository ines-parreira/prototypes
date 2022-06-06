import {useEffect, useState} from 'react'
import {
    fetchChatHelpCenterConfiguration,
    ChatHelpCenterConfiguration,
} from 'models/selfServiceConfiguration/resources'

export const useChatHelpCenterConfiguration = (
    chatApplicationId: number | null
) => {
    const [chatHelpCenterConfiguration, setChatHelpCenterConfiguration] =
        useState<ChatHelpCenterConfiguration | null>(null)

    useEffect(() => {
        if (chatApplicationId === null) {
            return
        }

        const fetchData = async () => {
            try {
                const data = await fetchChatHelpCenterConfiguration(
                    chatApplicationId
                )
                setChatHelpCenterConfiguration(data)
            } catch (error) {
                setChatHelpCenterConfiguration(null)
            }
        }

        void fetchData()
    }, [chatApplicationId])

    return {chatHelpCenterConfiguration, setChatHelpCenterConfiguration}
}
