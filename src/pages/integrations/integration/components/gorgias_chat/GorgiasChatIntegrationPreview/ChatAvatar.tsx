import React from 'react'
import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {getInitials} from 'pages/common/components/Avatar/utils'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatAvatarSettings,
} from 'models/integration/types'

import css from './ChatAvatar.less'

type Props = {
    agentName: string
    agentAvatarUrl?: string
    avatar?: GorgiasChatAvatarSettings
    chatTitle?: string
    className?: string
    showPlaceholderAvatar?: boolean
}
const ChatAvatar: React.FC<Props> = ({
    agentName,
    agentAvatarUrl,
    avatar,
    chatTitle,
    className,
    showPlaceholderAvatar,
}) => {
    const isAgentAvatarCustomizationEnabled =
        useFlags()[FeatureFlagKey.ChatAgentAvatarCustomization]

    const avatarUrl = isAgentAvatarCustomizationEnabled
        ? avatar?.imageType === GorgiasChatAvatarImageType.AGENT_PICTURE
            ? agentAvatarUrl
            : avatar?.imageType === GorgiasChatAvatarImageType.COMPANY_LOGO
            ? avatar.companyLogoUrl
            : undefined
        : agentAvatarUrl

    const name =
        isAgentAvatarCustomizationEnabled &&
        avatar?.nameType === GorgiasChatAvatarNameType.CHAT_TITLE
            ? chatTitle
            : agentName

    return (
        <div
            className={classnames(
                css.avatar,
                {
                    [css.placeholder]: showPlaceholderAvatar,
                },
                className
            )}
            style={{
                backgroundImage:
                    !showPlaceholderAvatar && avatarUrl
                        ? `url(${avatarUrl})`
                        : undefined,
            }}
        >
            {showPlaceholderAvatar ? (
                <i className="material-icons">person</i>
            ) : (
                !avatarUrl &&
                getInitials(
                    name,
                    isAgentAvatarCustomizationEnabled &&
                        avatar?.nameType ===
                            GorgiasChatAvatarNameType.AGENT_FIRST_NAME
                )
            )}
        </div>
    )
}

export default ChatAvatar
