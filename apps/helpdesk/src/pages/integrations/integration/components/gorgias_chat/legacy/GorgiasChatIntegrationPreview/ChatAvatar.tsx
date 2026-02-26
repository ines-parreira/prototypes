import Avatar from 'gorgias-design-system/Avatar/Avatar'
import type { GorgiasChatAvatarSettings } from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'

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

    const avatarUrl =
        avatar?.imageType === GorgiasChatAvatarImageType.AGENT_PICTURE
            ? agentAvatarUrl
            : avatar?.imageType === GorgiasChatAvatarImageType.COMPANY_LOGO
              ? avatar.companyLogoUrl
              : undefined

    const formattedAgentName =
        nameType === GorgiasChatAvatarNameType.AGENT_FIRST_NAME
            ? agentName.split(' ')[0]
            : agentName

    const name =
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
