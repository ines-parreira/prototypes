/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { FC, HTMLAttributes, ReactNode } from 'react'

import type { Theme } from '@emotion/react'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'

import { gorgiasColors } from 'gorgias-design-system/styles'
import { relativeDarken, relativeLighten } from 'gorgias-design-system/utils'
import type { ChatTheme } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview'

const getIconStylesByVariant = ({
    variant,
    fill,
    theme,
}: Pick<IconButtonProps, 'variant' | 'fill'> & {
    theme: ChatTheme
}) => {
    let color, hoverColor, activeColor

    switch (variant) {
        case 'primary':
            color = gorgiasColors.neutralGrey0

            if (fill === 'ghost') {
                color = theme?.mainColor
                hoverColor = relativeLighten(theme?.mainColor)
                activeColor = relativeDarken(theme?.mainColor)
            }
            break
        case 'dark':
            color = gorgiasColors.neutralGrey6
            break
        case 'light':
            color = gorgiasColors.neutralGrey0
            break
    }

    return {
        color,
        hoverColor,
        activeColor,
    }
}

const getButtonStylesByVariant = ({
    variant,
    fill,
    theme,
}: Pick<IconButtonProps, 'variant' | 'fill'> & {
    theme: ChatTheme
}) => {
    let color, hoverColor, activeColor

    switch (variant) {
        case 'primary':
            if (fill !== 'ghost') {
                color = theme.mainColor
                hoverColor = relativeLighten(theme.mainColor)
                activeColor = relativeDarken(theme.mainColor)
            }

            break
        case 'dark':
            hoverColor = 'rgba(22,22,22,0.1)'
            activeColor = 'rgba(22,22,22,0.15)'
            break
        case 'light':
            hoverColor = 'rgba(255,255,255,0.1)'
            activeColor = 'rgba(255,255,255,0.15)'
            break
    }

    return { color, hoverColor, activeColor }
}

const StyledIconContainer = styled.div<Omit<IconButtonProps, 'icon'>>`
    display: flex;
    justify-content: center;
    align-items: center;

    width: ${({ size }) => (size === 'small' ? '20px' : '24px')};
    height: ${({ size }) => (size === 'small' ? '20px' : '24px')};
`

const StyledButton = styled.button<
    Omit<IconButtonProps, 'icon'> & { theme: ChatTheme }
>`
    &,
    &:focus {
        outline: 0;
    }
    border: 0;
    border-radius: 4px;

    padding: ${({ size }) => (size === 'small' ? '4px' : '10px')};

    ${({ disabled, variant, fill, theme }) => {
        if (disabled && !(fill === 'ghost' && variant === 'primary')) {
            return `
                background: ${gorgiasColors.neutralGrey3};
            `
        }

        const { color, hoverColor, activeColor } = getButtonStylesByVariant({
            variant,
            fill,
            theme,
        })

        return `
            background: ${color || 'transparent'};
            &:hover {
                background: ${hoverColor};
            }
            &:active {
                background: ${activeColor};
            }
        `
    }}

    ${({ disabled, variant, fill, theme }) => {
        if (disabled) {
            let color = gorgiasColors.neutralGrey0

            if (fill === 'ghost' && variant === 'primary') {
                color = gorgiasColors.neutralGrey4
            }

            return `
                svg .withFill {
                    fill: ${color};
                }
            `
        }

        const { color, hoverColor, activeColor } = getIconStylesByVariant({
            variant,
            fill,
            theme,
        })

        return `
            svg .withFill {
                fill: ${color};
            }

            &:hover {
                svg .withFill {
                    fill: ${hoverColor};
                }
            }

            &:active {
                svg .withFill {
                    fill: ${activeColor};
                }
            }
        `
    }}
`

type IconButtonSize = 'small' | 'large'

export type IconButtonVariant = 'primary' | 'dark' | 'light'

type IconButtonFill = 'filled' | 'ghost'

type IconButtonProps = {
    /**
     * If true, prevents the user from interacting with the button.
     */
    disabled?: boolean

    /**
     * The size of the button.
     */
    size?: IconButtonSize
    /**
     * The variant of the button that defines the styling.
     */
    variant: IconButtonVariant
    /**
     * The fill style of the button.
     */
    fill: IconButtonFill

    /**
     * The icon that is placed inside the button.
     */
    icon: ReactNode
}

/**
 * A button component with an icon inside.
 * The color of the icon is applied to any element with the class `withFill`.
 */
const IconButton: FC<HTMLAttributes<HTMLButtonElement> & IconButtonProps> = ({
    disabled,
    size,
    variant,
    fill,
    icon,
    ...props
}) => {
    const theme: Theme = useTheme()
    return (
        <StyledButton
            type="button"
            disabled={disabled}
            size={size}
            variant={variant}
            fill={fill}
            // TODO(React18): Remove this once we upgrade to React 18
            theme={theme as unknown as ChatTheme}
            {...props}
        >
            <StyledIconContainer
                disabled={disabled}
                size={size}
                variant={variant}
                fill={fill}
            >
                {icon}
            </StyledIconContainer>
        </StyledButton>
    )
}

export default IconButton
