import { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

export const usePreselectedChat = ({
    onboardingChatIntegrationIds,
    chatChannels,
}: {
    onboardingChatIntegrationIds: number[] | undefined
    chatChannels: SelfServiceChatChannel[]
}): number[] => {
    if (
        onboardingChatIntegrationIds &&
        onboardingChatIntegrationIds.length > 0
    ) {
        return onboardingChatIntegrationIds.filter((it) =>
            chatChannels.find((channel) => channel.value.id === it),
        )
    }

    if (chatChannels.length === 1 && !chatChannels[0].value.isDisabled) {
        return [chatChannels[0].value.id]
    }

    return []
}
