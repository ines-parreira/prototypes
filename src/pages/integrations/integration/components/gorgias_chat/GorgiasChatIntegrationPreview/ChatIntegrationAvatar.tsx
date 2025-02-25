import React from 'react'

import classnames from 'classnames'
import { List, Map } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatAvatarSettings,
} from 'models/integration/types'
import { getInitials } from 'pages/common/components/Avatar/utils'
import { getHumanAgents } from 'state/agents/selectors'

import { GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE } from '../../../../../../config/integrations/gorgias_chat'

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
    const hasAvatarCustomization =
        useFlags()[FeatureFlagKey.ChatAgentAvatarCustomization]

    const agents = useAppSelector(getHumanAgents) as List<Map<any, any>>

    const {
        avatar,
        avatarType,
        avatarTeamPictureUrl,
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

    if (!hasAvatarCustomization) {
        if (
            avatarType === GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE &&
            !!avatarTeamPictureUrl
        ) {
            return (
                <div className={css['team-picture-wrapper']}>
                    <div
                        className={classnames(css['team-picture'])}
                        style={{
                            borderColor: isOnline ? mainColor : offlineColor,
                        }}
                    >
                        <img src={avatarTeamPictureUrl} alt="Team" />
                        {statusMarker}
                    </div>
                </div>
            )
        }

        return (
            <div className={css.agents}>
                {['first', 'middle', 'last'].map((position) => (
                    <div
                        className={classnames(
                            css.agent,
                            css.hasIcon,
                            css[position],
                        )}
                        key={position}
                        style={{
                            borderColor: isOnline ? mainColor : offlineColor,
                        }}
                    >
                        <i className="material-icons">person</i>
                        {position === 'middle' && statusMarker}
                    </div>
                ))}
            </div>
        )
    }

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
