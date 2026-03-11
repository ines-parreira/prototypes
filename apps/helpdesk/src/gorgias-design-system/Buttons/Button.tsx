/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { FC, HTMLAttributes, ReactNode } from 'react'

import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'

import { gorgiasColors } from 'gorgias-design-system/styles'
import {
    getContrastColor,
    relativeDarken,
    relativeLighten,
} from 'gorgias-design-system/utils'
import type { ChatTheme } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview'

import SpinnerIcon from './icons/SpinnerIcon'

const getButtonStylesByVariant = ({
    variant,
    theme,
}: {
    variant: ButtonVariant
    theme: ChatTheme
}) => {
    let backgroundColor, hoverBackgroundColor, activeBackgroundColor

    const lighterMainColor = relativeLighten(theme.mainColor)
    const darkerMainColor = relativeDarken(theme.mainColor)

    switch (variant) {
        case 'tertiary':
            backgroundColor = 'transparent'
            hoverBackgroundColor = lighterMainColor
            activeBackgroundColor = theme.mainColor
            break
        case 'primary':
            backgroundColor = theme.mainColor
            hoverBackgroundColor = lighterMainColor
            activeBackgroundColor = darkerMainColor
            break
        case 'secondary':
            backgroundColor = gorgiasColors.neutralGrey2
            hoverBackgroundColor = gorgiasColors.secondaryLight
            activeBackgroundColor = gorgiasColors.secondaryDark
            break
    }

    const color = getContrastColor(backgroundColor)
    const baseColor = variant === 'tertiary' ? theme.mainColor : color

    return {
        color,
        baseColor,
        backgroundColor,
        hoverBackgroundColor,
        activeBackgroundColor,
    }
}

const StyledIconContainer = styled.div`
    width: 20px;
    height: 20px;
`

const StyledSpinnerContainer = styled.div`
    animation: Spin 1s infinite linear;

    @keyframes Spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`

const StyledButtonWrapper = styled.span<
    Pick<ButtonProps, 'disabled' | 'isLoading' | 'isStretched'>
>`
    ${({ disabled, isLoading }) =>
        (disabled || isLoading) && 'cursor: not-allowed;'}

    ${({ isStretched }) => isStretched && 'width: 100%;'}
`

const StyledButton = styled.button<ButtonProps & { theme: ChatTheme }>`
    display: flex;
    gap: 8px;

    font-size: 14px;
    font-weight: 500;

    &,
    &:focus {
        outline: 0;
    }

    border: ${({ variant, theme, disabled }) =>
        variant === 'tertiary' && !disabled
            ? `1px solid ${theme.mainColor}`
            : '0'};
    border-radius: 4px;

    user-select: none;

    padding: ${({ size }) => (size === 'small' ? '8px 16px;' : '14px 20px;')};

    ${({ disabled, isLoading }) =>
        (disabled || isLoading) && 'pointer-events: none;'}

    ${({ isStretched }) =>
        isStretched &&
        'width: 100%; justify-content: center; text-transform: capitalize;'}

    ${({ theme, variant, disabled }) => {
        if (disabled) {
            return `
                background-color: ${gorgiasColors.neutralGrey3};
                color: ${gorgiasColors.white};

                svg path {
                    fill: ${gorgiasColors.white};
                }
            `
        }

        const {
            color,
            baseColor,
            backgroundColor,
            hoverBackgroundColor,
            activeBackgroundColor,
        } = getButtonStylesByVariant({
            variant,
            theme,
        })

        return `            
            color: ${baseColor};
            background-color: ${backgroundColor};
            svg path {
                fill: ${baseColor};
            }

            :hover {
                color: ${color};
                background-color: ${hoverBackgroundColor};
                svg path {
                    fill: ${color};
                }
            }

            :active {
                color: ${color};
                background-color: ${activeBackgroundColor};
                svg path {
                    fill: ${color};
                }
            }
        `
    }}
`

type ButtonSize = 'small' | 'large'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary'

type ButtonProps = {
    /**
     * If true, prevents the user from interacting with the button.
     */
    disabled?: boolean
    /**
     * If true, shows a loading indicator and prevents the user from interacting with the button.
     */
    isLoading?: boolean
    /**
     * If true, the button will stretch to fill the width of its container.
     */
    isStretched?: boolean
    /**
     * The size of the button.
     */
    size: ButtonSize
    /**
     * The variant of the button that defines the styling.
     */
    variant: ButtonVariant

    /**
     * An icon that is placed before the button text.
     */
    leadIcon?: ReactNode
    /**
     * An icon that is placed after the button text.
     */
    trailIcon?: ReactNode
}

/**
 * A button component that supports variants, sizes, loading/disabled states and leading/trailing icons.
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Button />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const Button: FC<HTMLAttributes<HTMLButtonElement> & ButtonProps> = ({
    disabled,
    isLoading,
    isStretched,
    size,
    variant,
    leadIcon = null,
    trailIcon = null,
    children,
    ...props
}) => {
    const theme = useTheme()

    return (
        <StyledButtonWrapper
            disabled={disabled}
            isLoading={isLoading}
            isStretched={isStretched}
        >
            <StyledButton
                disabled={disabled}
                isLoading={isLoading}
                size={size}
                variant={variant}
                isStretched={isStretched}
                // TODO(React18): Remove this once we upgrade to React 18
                theme={theme as unknown as ChatTheme}
                {...props}
            >
                {isLoading ? (
                    <StyledSpinnerContainer>
                        <SpinnerIcon />
                    </StyledSpinnerContainer>
                ) : (
                    leadIcon && (
                        <StyledIconContainer>{leadIcon}</StyledIconContainer>
                    )
                )}
                <span>{children}</span>
                {trailIcon && (
                    <StyledIconContainer>{trailIcon}</StyledIconContainer>
                )}
            </StyledButton>
        </StyledButtonWrapper>
    )
}

export default Button
