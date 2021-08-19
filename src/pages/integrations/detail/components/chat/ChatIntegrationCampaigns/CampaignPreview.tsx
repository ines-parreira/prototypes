import React, {Component} from 'react'

import Avatar from '../../../../../common/components/Avatar/Avatar'

import css from './CampaignPreview.less'

type Props = {
    html?: string
    authorName?: string
    authorAvatarUrl?: string
    mainColor?: string
    translatedTexts: {
        poweredByGorgias: string
        campaignClickToReply: string
    }
}

export default class CampaignPreview extends Component<Props> {
    render() {
        const {
            html,
            authorName,
            authorAvatarUrl,
            mainColor,
            translatedTexts,
        } = this.props

        const _bgColor = (color: string) => ({backgroundColor: color})

        return (
            <div className={css.preview}>
                <div className={css.titlebar} />
                <div className={css.campaign}>
                    <div className={css.header}>
                        <div className={css.author}>
                            <Avatar
                                key={authorAvatarUrl}
                                className={css.authorAvatar}
                                name={authorName || 'Random agent'}
                                url={authorAvatarUrl}
                            />
                        </div>
                        <div className={css.message}>
                            <div className={css.authorName}>
                                <b>{authorName || "[Random agent's name]"}</b>
                            </div>
                            <div
                                className={css.messageText}
                                dangerouslySetInnerHTML={{__html: html!}}
                            />
                        </div>
                    </div>

                    <div className={css.poweredby}>
                        {translatedTexts.poweredByGorgias}
                    </div>

                    <div className={css.footer}>
                        {translatedTexts.campaignClickToReply}
                    </div>
                </div>

                <div className={css.button} style={_bgColor(mainColor!)}>
                    <img
                        alt="close icon"
                        className={css.icon}
                        src={`${
                            window.GORGIAS_ASSETS_URL || ''
                        }/static/private/img/icons/DefaultCloseIcon.svg`}
                    />
                </div>
            </div>
        )
    }
}
