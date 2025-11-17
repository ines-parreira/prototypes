import classnames from 'classnames'
import type { List, Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import type { GorgiasChatAvatarSettings } from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import { getInitials } from 'pages/common/components/Avatar/utils'
import { getHumanAgents } from 'state/agents/selectors'

import css from './ChatIntegrationPreview.less'

type Props = {
    avatar?: GorgiasChatAvatarSettings
    avatarTeamPictureUrl?: string | null
    avatarType?: string
    isOnline: boolean
    mainColor: string
    offlineColor: string
    shouldHideAvatarOnlineMarker: boolean
}

const ChatIntegrationAvatar = (props: Props) => {
    const agents = useAppSelector(getHumanAgents) as List<Map<any, any>>

    const {
        avatar,
        isOnline,
        mainColor,
        offlineColor,
        shouldHideAvatarOnlineMarker,
    } = props

    const statusMarker = shouldHideAvatarOnlineMarker ? null : (
        <div
            className={classnames({
                [css.onlineMarker]: isOnline,
                [css.offlineMarker]: !isOnline,
            })}
        />
    )

    const positions =
        agents.size < 3 ||
        avatar?.imageType === GorgiasChatAvatarImageType.COMPANY_LOGO
            ? ['middle']
            : ['first', 'middle', 'last']

    const useFirstInitialOnly =
        avatar?.nameType === GorgiasChatAvatarNameType.AGENT_FIRST_NAME

    return (
        <div className={css.agents}>
            {positions.map((position, index) => {
                const agent = agents.get(index)

                const profilePictureUrl: string | undefined =
                    avatar?.imageType ===
                    GorgiasChatAvatarImageType.AGENT_INITIALS
                        ? undefined
                        : avatar?.imageType ===
                            GorgiasChatAvatarImageType.AGENT_PICTURE
                          ? agent.getIn(['meta', 'profile_picture_url'])
                          : avatar?.companyLogoUrl

                return (
                    <div
                        className={classnames(css.agent, css[position], {
                            [css.hasPicture]: !!profilePictureUrl,
                            [css.single]: positions.length === 1,
                        })}
                        key={position}
                        style={{
                            borderColor: isOnline ? mainColor : offlineColor,
                            backgroundImage:
                                profilePictureUrl &&
                                `url(${profilePictureUrl})`,
                        }}
                    >
                        {getInitials(agent.get('name'), useFirstInitialOnly)}
                        {position === 'middle' && statusMarker}
                    </div>
                )
            })}
        </div>
    )
}

export default ChatIntegrationAvatar
