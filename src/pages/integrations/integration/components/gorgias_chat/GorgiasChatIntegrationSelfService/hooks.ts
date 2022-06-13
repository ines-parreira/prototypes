import {useEffect, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {
    fetchChatHelpCenterConfiguration,
    ChatHelpCenterConfiguration,
} from 'models/selfServiceConfiguration/resources'

export const useChatHelpCenterConfiguration = (
    chatApplicationId: number | null
) => {
    const [chatHelpCenterConfiguration, setChatHelpCenterConfiguration] =
        useState<ChatHelpCenterConfiguration | null>(null)

    const [{loading: chatHelpCenterConfigurationLoading}, fetchData] =
        useAsyncFn(async () => {
            if (chatApplicationId === null) {
                return
            }

            try {
                const data = await fetchChatHelpCenterConfiguration(
                    chatApplicationId
                )
                setChatHelpCenterConfiguration(data)
            } catch (error) {
                setChatHelpCenterConfiguration(null)
            }
        }, [chatApplicationId])

    useEffect(() => {
        void fetchData()
    }, [fetchData])

    return {
        chatHelpCenterConfiguration,
        setChatHelpCenterConfiguration,
        chatHelpCenterConfigurationLoading,
    }
}
