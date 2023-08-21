import React from 'react'
import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {addLinkToDownloadFonts} from 'pages/settings/common/FontSelectField/FontSelectField'
import {assetsUrl} from 'utils'

import {
    GorgiasChatLauncherType,
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
} from 'models/integration/types'

import Launcher from 'gorgias-design-system/Launcher/Launcher'

import {FeatureFlagKey} from 'config/featureFlags'

import {GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT} from 'config/integrations/gorgias_chat'
import {PositionAxis} from '../GorgiasChatIntegrationAppearance/GorgiasChatIntegrationAppearance'

import css from './CustomizedChatLauncher.less'

const offsetLine = assetsUrl('/img/icons/offset-line.svg')

/**
 * Use the same fallback fonts as the real widget.
 */
export const defaultChatFontFamily =
    'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif'

type Props = {
    className?: string
    launcher?: {
        type: GorgiasChatLauncherType
        label?: string
    }
    position: GorgiasChatPosition
    mainColor?: string
    mainFontFamily: string
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
    mainFontFamily,
    editedPositionAxis,
    hideButton,
    isClosed,
}) => {
    const isLauncherCustomizationEnabled =
        useFlags()[FeatureFlagKey.ChatLauncherCustomization]

    if (mainFontFamily !== GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT) {
        addLinkToDownloadFonts([mainFontFamily])
    }

    const isButtonOnTop =
        alignment === GorgiasChatPositionAlignmentEnum.TOP_RIGHT ||
        alignment === GorgiasChatPositionAlignmentEnum.TOP_LEFT

    return (
        <div
            className={classnames(css.wrapper, className, {
                [css.buttonOnTop]: isButtonOnTop,
            })}
            style={{
                fontFamily: `${
                    mainFontFamily ?? GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT
                }, ${defaultChatFontFamily}`,
            }}
        >
            {!hideButton && (
                <div
                    className={classnames(css.buttonWrapper, css[alignment], {
                        [css.editing]: !!editedPositionAxis,
                    })}
                >
                    <div className={css.axisLauncherWrapper}>
                        <Launcher
                            fillColor={mainColor}
                            label={launcher.label}
                            shouldHideLabel={
                                launcher.type === GorgiasChatLauncherType.ICON
                            }
                            hasLaunched={
                                !isLauncherCustomizationEnabled || !isClosed
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
            <div
                className={classnames({
                    [css.isPlaceholder]: isClosed || editedPositionAxis,
                })}
            >
                {children}
            </div>
        </div>
    )
}

export default CustomizedChatLauncher
