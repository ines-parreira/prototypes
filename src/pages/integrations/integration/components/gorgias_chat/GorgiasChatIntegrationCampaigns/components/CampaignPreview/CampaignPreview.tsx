import React from 'react'
import classnames from 'classnames'

import {
    GorgiasChatLauncherType,
    GorgiasChatAvatarSettings,
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
} from 'models/integration/types'

import {CampaignProduct} from '../../types/CampaignProduct'

import ChatLauncher from '../../../GorgiasChatIntegrationPreview/ChatLauncher'

import {ChatCampaign} from './components/ChatCampaign'

import css from './CampaignPreview.less'

type Props = {
    html: string
    authorName?: string
    authorAvatarUrl?: string
    avatar?: GorgiasChatAvatarSettings
    chatTitle?: string
    mainColor?: string
    translatedTexts: Record<string, string>
    position: GorgiasChatPosition
    products?: CampaignProduct[]
}

const CampaignPreview = ({
    html,
    authorName,
    authorAvatarUrl,
    avatar,
    chatTitle,
    mainColor,
    translatedTexts,
    position,
    products = [],
}: Props) => {
    const isChatLauncherOnTop =
        position.alignment === GorgiasChatPositionAlignmentEnum.TOP_RIGHT ||
        position.alignment === GorgiasChatPositionAlignmentEnum.TOP_LEFT

    const isChatLauncherOnRight =
        position.alignment === GorgiasChatPositionAlignmentEnum.TOP_RIGHT ||
        position.alignment === GorgiasChatPositionAlignmentEnum.BOTTOM_RIGHT

    return (
        <div className={css.preview}>
            <div
                className={classnames({
                    [css.container]: true,
                    [css.chatLauncherOnTop]: isChatLauncherOnTop,
                })}
            >
                <ChatCampaign
                    authorAvatarUrl={authorAvatarUrl}
                    authorName={authorName}
                    avatar={avatar}
                    chatTitle={chatTitle}
                    html={html}
                    products={products}
                    translatedTexts={translatedTexts}
                />
                <div
                    className={classnames(css.chatLauncherWrapper, {
                        [css.chatLauncherOnRight]: isChatLauncherOnRight,
                    })}
                >
                    <ChatLauncher
                        className={css.chatLauncher}
                        type={GorgiasChatLauncherType.ICON}
                        backgroundColor={mainColor!}
                        windowState="opened"
                    />
                </div>
            </div>
        </div>
    )
}

export default CampaignPreview
