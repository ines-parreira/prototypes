import type { List, Map } from 'immutable'

import Avatar from 'gorgias-design-system/Avatar/Avatar'
import AvatarGroup from 'gorgias-design-system/Avatar/AvatarGroup'
import useAppSelector from 'hooks/useAppSelector'
import type { GorgiasChatAvatarSettings } from 'models/integration/types'
import { GorgiasChatAvatarImageType } from 'models/integration/types'
import { getHumanAgents } from 'state/agents/selectors'

type Props = {
    avatar?: GorgiasChatAvatarSettings
    chatTitle: string
}

const ConversationAvatars: React.FC<Props> = ({ avatar, chatTitle }) => {
    const agents = useAppSelector(getHumanAgents) as List<Map<any, any>>

    if (avatar?.imageType === GorgiasChatAvatarImageType.COMPANY_LOGO) {
        return (
            <Avatar
                src={avatar?.companyLogoUrl}
                name={chatTitle}
                hasStatusIndicator
            />
        )
    }

    return (
        <AvatarGroup>
            {agents
                .slice(0, 3)
                .toArray()
                .map((agent, index) => (
                    <Avatar
                        key={index}
                        src={
                            (avatar?.imageType ===
                                GorgiasChatAvatarImageType.AGENT_PICTURE &&
                                agent?.getIn([
                                    'meta',
                                    'profile_picture_url',
                                ])) ||
                            undefined
                        }
                        name={agent?.get('name')}
                        hasStatusIndicator
                    />
                ))}
        </AvatarGroup>
    )
}

export default ConversationAvatars
