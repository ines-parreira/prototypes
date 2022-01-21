import React, {Component} from 'react'
import classnames from 'classnames'

import Avatar from '../../../../../common/components/Avatar/Avatar'
import {
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
} from '../../../../../../models/integration/types'
import CloseIcon from '../../../../../../../js/assets/img/icons/DefaultCloseIcon.svg'
import GorgiasChatPoweredBy from '../GorgiasChatIntegrationPreview/GorgiasChatPoweredBy'

import css from './CampaignPreview.less'

type Props = {
    html: string
    authorName?: string
    authorAvatarUrl?: string
    mainColor?: string
    translatedTexts: Record<string, string>
    position: GorgiasChatPosition
}

export default class CampaignPreview extends Component<Props> {
    render() {
        const {
            html,
            authorName,
            authorAvatarUrl,
            mainColor,
            translatedTexts,
            position,
        } = this.props

        const _bgColor = (color?: string) => ({backgroundColor: color})

        const isButtonOnTop =
            position.alignment === GorgiasChatPositionAlignmentEnum.TOP_RIGHT ||
            position.alignment === GorgiasChatPositionAlignmentEnum.TOP_LEFT

        return (
            <div className={css.preview}>
                <div className={css.titlebar} />
                {isButtonOnTop && (
                    <div
                        className={classnames(
                            css.button,
                            css[position.alignment]
                        )}
                        style={_bgColor(mainColor)}
                    >
                        <img
                            className={css.icon}
                            src={`${
                                window.GORGIAS_ASSETS_URL || ''
                            }/static/private/img/icons/DefaultCloseIcon.svg`}
                            alt="Close icon"
                        />
                    </div>
                )}
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
                                dangerouslySetInnerHTML={{__html: html}}
                            />
                        </div>
                    </div>

                    <GorgiasChatPoweredBy translatedTexts={translatedTexts} />

                    <div className={css.footer}>
                        {translatedTexts.campaignClickToReply}
                    </div>
                </div>
                {!isButtonOnTop && (
                    <div
                        className={classnames(
                            css.button,
                            css[position.alignment]
                        )}
                        style={_bgColor(mainColor)}
                    >
                        <img
                            className={css.icon}
                            src={CloseIcon}
                            alt="Close icon"
                        />
                    </div>
                )}
            </div>
        )
    }
}
