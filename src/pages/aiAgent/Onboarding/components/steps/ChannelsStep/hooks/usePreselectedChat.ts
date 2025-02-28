import { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

export const usePreselectedChat = ({
    onboardingChatIntegrationIds,
    chatChannels,
}: {
    onboardingChatIntegrationIds: number[] | undefined
    chatChannels: SelfServiceChatChannel[]
}): number[] => {
    if (onboardingChatIntegrationIds) {
        return onboardingChatIntegrationIds
    }

    if (chatChannels.length === 1 && !chatChannels[0].value.isDisabled) {
        return [chatChannels[0].value.id]
    }

    return []
}
