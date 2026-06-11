import type { HTMLAttributes } from 'react'
import type React from 'react'

import styled from '@emotion/styled'

import { gorgiasColors } from 'gorgias-design-system/styles'

import { deriveLauncherColors } from './deriveLauncherColors'
import { BubbleIconRedesigned } from './icons/BubbleIconRedesigned'
import { CloseIcon } from './icons/CloseIcon'

const StyledLabel = styled.span<{
    showIconOnly: boolean
    color: string
}>`
    position: relative;
    z-index: 3;

    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: pre;
    color: ${({ color }) => color};

    margin-left: 32px;

    transition: opacity 200ms ease;

    ${({ showIconOnly }) => showIconOnly && 'opacity: 0;'}
`

const StyledIconContainer = styled.div<{
    isLabelHidden: boolean
    isCloseIcon?: boolean
    hideIcon?: boolean
}>`
    position: absolute;
    z-index: 3;

    display: flex;
    justify-content: center;
    align-items: center;

    transition: all 200ms ease;

    ${({ hideIcon }) => hideIcon && 'opacity: 0;'}

    ${({ isCloseIcon, isLabelHidden }) => {
        let iconSize, padding

        iconSize = padding = '20px'

        if (isCloseIcon) {
            padding = '16px'
        } else if (isLabelHidden) {
            iconSize = '26px'
            padding = '13px'
        }

        return `
            left: ${padding};
            width: ${iconSize};
            height: ${iconSize};
        `
    }}
`

const StyledBadge = styled.div`
    position: absolute;

    left: 0;
    top: 0;

    transform: translate(-25%, -25%);

    z-index: 4;

    font-size: 12px;
    font-weight: 600;

    padding: 0 8px;
    border-radius: 10px;
    background: ${gorgiasColors.supportingRed6};
    color: ${gorgiasColors.white};
`

const GradientLayer = styled.div`
    position: absolute;
    inset: 0;
    border-radius: inherit;
`

const StyledLauncher = styled.button<{
    showIconOnly: boolean
}>`
    cursor: pointer;

    display: inline-flex;
    align-items: center;

    padding: 16px 20px;

    position: relative;

    background: transparent;

    &,
    &:focus {
        outline: 0;
    }

    border: 0;
    border-radius: 100px;

    box-shadow: 0px 2px 4px rgba(22, 22, 22, 0.16);

    transition: all 200ms ease;

    ${({ showIconOnly }) => {
        const buttonSize = '52px'
        const horizontalPadding = '20px'
        const iconWidth = '32px'

        return `
            padding: 16px ${horizontalPadding};
            height: ${buttonSize};
            max-width: ${
                showIconOnly
                    ? buttonSize
                    : `calc(20ch + ${horizontalPadding} * 2 + ${iconWidth})`
            };
        `
    }}
`

type LauncherProps = {
    /**
     * The text that will be displayed on the button.
     */
    label?: string
    /**
     * If true, the label will be hidden and only the icon will be displayed after a 1200ms delay.
     */
    shouldHideLabel?: boolean

    /**
     * If true, the button will display a close icon instead of the company logo and provided label.
     */
    hasLaunched?: boolean

    /**
     * The number to be displayed in the top left corner of the launcher.
     * It will not be displayed when `hasLaunched` is true.
     * The limit for unread message count is 99, a higher number will result in "99+" being displayed.
     */
    unreadMessagesCount?: number

    /**
     * The color of the button.
     */
    fillColor?: string
}

/**
 * Launcher is a button that is used to open/close the widget when clicked.
 */
const Launcher: React.FC<LauncherProps & HTMLAttributes<HTMLButtonElement>> = ({
    label,
    shouldHideLabel = false,
    hasLaunched,
    unreadMessagesCount = 0,
    fillColor = gorgiasColors.primary,
    ...props
}) => {
    const colors = deriveLauncherColors(fillColor)

    const showIconOnly = hasLaunched || !!shouldHideLabel

    const unreadMessages =
        unreadMessagesCount > 99 ? '99+' : unreadMessagesCount

    return (
        <StyledLauncher showIconOnly={showIconOnly} {...props}>
            <GradientLayer
                style={{
                    background: `radial-gradient(circle at center, ${colors.glowStop0} 0%, ${colors.glowStop50} 50%, ${colors.glowStop100} 100%)`,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    zIndex: 0,
                }}
            />
            <GradientLayer
                style={{
                    background: `radial-gradient(ellipse at center, ${colors.sheenStop0} 0%, ${colors.sheenStop100} 100%)`,
                    zIndex: 1,
                }}
            />
            <GradientLayer
                style={{
                    background: `radial-gradient(circle at center, ${colors.bloomColor} 0%, transparent 70%)`,
                    filter: 'blur(8px)',
                    zIndex: 2,
                    inset: '4px',
                }}
            />
            {!hasLaunched && unreadMessagesCount > 0 && (
                <StyledBadge
                    role="status"
                    aria-live="assertive"
                    aria-label={
                        unreadMessagesCount === 1
                            ? '1 unseen message'
                            : `${unreadMessages} unseen messages`
                    }
                    aria-hidden="true"
                >
                    {unreadMessages}
                </StyledBadge>
            )}
            <StyledIconContainer
                isLabelHidden={showIconOnly}
                hideIcon={hasLaunched}
            >
                <BubbleIconRedesigned
                    color={colors.iconColor}
                    dotsColor={colors.dotsColor}
                />
            </StyledIconContainer>
            <StyledIconContainer
                isLabelHidden={showIconOnly}
                hideIcon={!hasLaunched}
                isCloseIcon
            >
                <CloseIcon color={colors.closeIconColor} />
            </StyledIconContainer>
            <StyledLabel showIconOnly={showIconOnly} color={colors.labelColor}>
                {label}
            </StyledLabel>
        </StyledLauncher>
    )
}

export { Launcher }
