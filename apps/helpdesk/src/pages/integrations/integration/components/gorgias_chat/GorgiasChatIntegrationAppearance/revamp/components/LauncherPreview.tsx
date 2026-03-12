import { deriveLauncherColors } from 'gorgias-design-system/Launcher/deriveLauncherColors'
import BubbleIconRedesigned from 'gorgias-design-system/Launcher/icons/BubbleIconRedesigned'

import css from './LauncherPreview.less'

type LauncherPreviewProps = {
    fillColor: string
    label?: string
}

export function LauncherPreview({ fillColor, label }: LauncherPreviewProps) {
    const colors = deriveLauncherColors(fillColor)

    const isPill = label != null && label.length > 0

    const layerOpacity = isPill ? 0.6 : 1

    const glowStyle = {
        background: `radial-gradient(circle at center, ${colors.glowStop0} 0%, ${colors.glowStop50} 50%, ${colors.glowStop100} 100%)`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 0,
        opacity: layerOpacity,
    }

    const sheenStyle = {
        background: `radial-gradient(ellipse at center, ${colors.sheenStop0} 0%, ${colors.sheenStop100} 100%)`,
        zIndex: 1,
        opacity: layerOpacity,
    }

    const bloomStyle = {
        background: `radial-gradient(circle at center, ${colors.bloomColor} 0%, transparent 70%)`,
        filter: 'blur(8px)',
        zIndex: 2,
        opacity: layerOpacity,
    }

    const iconSize = isPill ? 20 : 28

    return (
        <div
            className={`${css.launcher} ${isPill ? css.launcherPill : css.launcherIconOnly}`}
        >
            <div className={css.gradientLayer} style={glowStyle} />
            <div className={css.gradientLayer} style={sheenStyle} />
            <div className={css.bloomLayer} style={bloomStyle} />
            <div
                className={
                    isPill ? css.iconContainerPill : css.iconContainerIconOnly
                }
            >
                <BubbleIconRedesigned
                    color={colors.iconColor}
                    dotsColor={colors.dotsColor}
                    size={iconSize}
                />
            </div>
            {isPill && (
                <span
                    className={css.label}
                    style={{ color: colors.labelColor }}
                >
                    {label}
                </span>
            )}
        </div>
    )
}
