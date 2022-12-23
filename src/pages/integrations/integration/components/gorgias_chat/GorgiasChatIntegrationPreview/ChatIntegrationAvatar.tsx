import React from 'react'
import classnames from 'classnames'

import {GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE} from '../../../../../../config/integrations/gorgias_chat'

import css from './ChatIntegrationPreview.less'

type Props = {
    avatarTeamPictureUrl?: string | null
    avatarType?: string
    isOnline: boolean
    mainColor: string
    offlineColor: string
}

const ChatIntegrationAvatar = (props: Props) => {
    const {
        avatarType,
        avatarTeamPictureUrl,
        isOnline,
        mainColor,
        offlineColor,
    } = props

    const statusMarker = (
        <div
            className={classnames({
                [css.onlineMarker]: isOnline,
                [css.offlineMarker]: !isOnline,
            })}
        />
    )

    if (
        avatarType === GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE &&
        !!avatarTeamPictureUrl
    ) {
        return (
            <div className={css['team-picture-wrapper']}>
                <div
                    className={classnames(css['team-picture'])}
                    style={{borderColor: isOnline ? mainColor : offlineColor}}
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
                    className={classnames(css.agent, css[position])}
                    key={position}
                    style={{borderColor: isOnline ? mainColor : offlineColor}}
                >
                    <i className="material-icons">person</i>
                    {position === 'middle' && statusMarker}
                </div>
            ))}
        </div>
    )
}

export default ChatIntegrationAvatar
