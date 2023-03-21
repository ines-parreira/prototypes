import React from 'react'
import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {assetsUrl} from 'utils'

import {
    GorgiasChatLauncherType,
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
} from 'models/integration/types'

import {FeatureFlagKey} from 'config/featureFlags'

import {PositionAxis} from '../GorgiasChatIntegrationAppearance/GorgiasChatIntegrationAppearance'

import ChatLauncher from './ChatLauncher'

import css from './CustomizedChatLauncher.less'

const offsetLine = assetsUrl('/img/icons/offset-line.svg')

type Props = {
    className?: string
    launcher?: {
        type: GorgiasChatLauncherType
        label?: string
    }
    position: GorgiasChatPosition
    mainColor?: string
    editedPositionAxis?: PositionAxis | null
    hideButton?: boolean
    isClosed?: boolean
}

const CustomizedChatLauncher: React.FC<Props> = ({
    className,
    children,
    launcher = {
        type: GorgiasChatLauncherType.ICON,
    },
    position: {alignment, offsetX, offsetY},
    mainColor,
    editedPositionAxis,
    hideButton,
    isClosed,
}) => {
    const isLauncherCustomizationEnabled =
        useFlags()[FeatureFlagKey.ChatLauncherCustomization]

    const isButtonOnTop =
        alignment === GorgiasChatPositionAlignmentEnum.TOP_RIGHT ||
        alignment === GorgiasChatPositionAlignmentEnum.TOP_LEFT

    return (
        <div
            className={classnames(css.wrapper, className, {
                [css.buttonOnTop]: isButtonOnTop,
            })}
        >
            {!hideButton && (
                <div
                    className={classnames(css.buttonWrapper, css[alignment], {
                        [css.editing]: !!editedPositionAxis,
                        [css.withLabel]:
                            launcher.type ===
                            GorgiasChatLauncherType.ICON_AND_LABEL,
                    })}
                >
                    <div className={css.axisLauncherWrapper}>
                        <ChatLauncher
                            {...launcher}
                            backgroundColor={mainColor}
                            windowState={
                                !isLauncherCustomizationEnabled || isClosed
                                    ? 'closed'
                                    : 'opened'
                            }
                        />
                        {editedPositionAxis === PositionAxis.AXIS_Y && (
                            <div className={css.axisCenter}>
                                <div className={css.axisY}>
                                    <div className={css.offsetLine}>
                                        <img
                                            src={offsetLine}
                                            alt="Offset Line"
                                        />
                                    </div>
                                    <div className={css.offsetContent}>
                                        {`${offsetY}px`}
                                    </div>
                                </div>
                            </div>
                        )}
                        {editedPositionAxis === PositionAxis.AXIS_X && (
                            <div className={css.axisX}>
                                <div className={css.offsetLine}>
                                    <img src={offsetLine} alt="Offset Line" />
                                </div>
                                <div className={css.offsetContent}>
                                    {`${offsetX}px`}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {isClosed || editedPositionAxis ? (
                <div className={css.transparentPlaceholder}></div>
            ) : (
                <div>{children}</div>
            )}
        </div>
    )
}

export default CustomizedChatLauncher
