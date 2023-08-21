import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatAvatarSettings,
} from 'models/integration/types'

import Avatar from 'gorgias-design-system/Avatar/Avatar'

type Props = {
    agentName: string
    agentAvatarUrl?: string
    avatar?: GorgiasChatAvatarSettings
    chatTitle?: string
    showPlaceholderAvatar?: boolean
    forceNameType?: GorgiasChatAvatarNameType
    size?: number
    showName?: boolean
}
const ChatAvatar: React.FC<Props> = ({
    agentName,
    agentAvatarUrl,
    avatar,
    chatTitle,
    showPlaceholderAvatar,
    forceNameType,
    size,
    showName,
}) => {
    const nameType = forceNameType || avatar?.nameType

    const isAgentAvatarCustomizationEnabled =
        useFlags()[FeatureFlagKey.ChatAgentAvatarCustomization]

    const avatarUrl = isAgentAvatarCustomizationEnabled
        ? avatar?.imageType === GorgiasChatAvatarImageType.AGENT_PICTURE
            ? agentAvatarUrl
            : avatar?.imageType === GorgiasChatAvatarImageType.COMPANY_LOGO
            ? avatar.companyLogoUrl
            : undefined
        : agentAvatarUrl

    const formattedAgentName =
        isAgentAvatarCustomizationEnabled &&
        nameType === GorgiasChatAvatarNameType.AGENT_FIRST_NAME
            ? agentName.split(' ')[0]
            : agentName

    const name =
        isAgentAvatarCustomizationEnabled &&
        nameType === GorgiasChatAvatarNameType.CHAT_TITLE
            ? chatTitle
            : formattedAgentName

    return (
        <Avatar
            showPlaceholderAvatar={showPlaceholderAvatar}
            src={avatarUrl}
            name={name}
            size={size}
            showName={showName}
        />
    )
}

export default ChatAvatar
