import React, {useMemo} from 'react'
import classnames from 'classnames'

import {GorgiasChatLauncherType} from 'models/integration/types'
import {getTextColorBasedOnBackground} from '../color-utils'

import BubbleIcon from './icons/Bubble'
import CrossIcon from './icons/Cross'

import css from './ChatLauncher.less'

interface LauncherProps {
    type: GorgiasChatLauncherType
    label?: string
    backgroundColor: string
    className?: string
    windowState: 'closed' | 'opened'
}

const ChatLauncher: React.FC<LauncherProps> = ({
    type,
    className,
    backgroundColor,
    label,
    windowState,
}) => {
    const contentColor = useMemo(
        () => getTextColorBasedOnBackground(backgroundColor),
        [backgroundColor]
    )

    const Icon = windowState === 'opened' ? CrossIcon : BubbleIcon

    return (
        <div
            className={classnames(
                css.launcher,
                type === GorgiasChatLauncherType.ICON_AND_LABEL &&
                    windowState === 'closed' &&
                    css.iconAndLabelMode,
                className
            )}
            style={{backgroundColor}}
        >
            <div className={css.iconWrapper}>
                <Icon fill={contentColor} className={css.icon} />
            </div>

            {type === GorgiasChatLauncherType.ICON_AND_LABEL &&
                windowState === 'closed' && (
                    <div className={css.label} style={{color: contentColor}}>
                        {label}
                    </div>
                )}
        </div>
    )
}

export default ChatLauncher
