import React from 'react'
import classnames from 'classnames'

import CloseIcon from 'assets/img/icons/DefaultCloseIcon.svg'

import {GorgiasChatPositionAlignmentEnum} from 'models/integration/types/gorgiasChat'

import css from './ChatBubble.less'

type Props = {
    alignment: GorgiasChatPositionAlignmentEnum
    color?: string
}

export const ChatBubble = ({alignment, color}: Props) => {
    const _bgColor = (color?: string) => ({backgroundColor: color})

    return (
        <div
            className={classnames(css.button, css[alignment])}
            style={_bgColor(color)}
        >
            <img className={css.icon} src={CloseIcon} alt="Close icon" />
        </div>
    )
}
