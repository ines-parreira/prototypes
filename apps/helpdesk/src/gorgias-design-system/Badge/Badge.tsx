/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { FC, HTMLAttributes } from 'react'

import styled from '@emotion/styled'

import type { ColorType } from 'gorgias-design-system/styles'
import { gorgiasColors } from 'gorgias-design-system/styles'

export type BadgeColor = Extract<
    ColorType,
    | 'accessoryBlue'
    | 'accessoryPink'
    | 'accessoryYellow'
    | 'accessoryGrey'
    | 'accessoryTeal'
    | 'accessoryGreen'
    | 'accessoryOrange'
    | 'accessoryPurple'
    | 'accessoryRed'
    | 'accessoryBlack'
>

export interface BadgeProps extends HTMLAttributes<HTMLElement> {
    /**
     * The text to display in the badge.
     */
    label: string
    /**
     * The color of the badge.
     * @default 'accessoryBlue'
     */
    color?: BadgeColor
}

const transformColor = (color: BadgeColor) => {
    return color.startsWith('accessory')
        ? gorgiasColors[`${color}Text` as ColorType]
        : gorgiasColors.dark
}

const StyledBadge = styled.div<{ color?: BadgeColor }>`
    display: flex;
    padding: 2px 8px;
    justify-content: center;
    align-items: center;
    width: fit-content;

    border-radius: 100px;

    font-size: 11px;
    font-weight: 600;
    line-height: 14px;
    letter-spacing: 0.55px;
    text-transform: uppercase;
    text-align: center;

    background-color: ${({ color }) =>
        color ? gorgiasColors[color] : gorgiasColors.accessoryBlue};
    color: ${({ color }) =>
        color ? transformColor(color) : gorgiasColors.dark};
`

/**
 * Non-interactive components used to display statuses or information.
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Tag />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
export const Badge: FC<BadgeProps> = ({ ...props }: BadgeProps) => {
    const { label, color = 'accessoryBlue' } = props
    return (
        <StyledBadge color={color} {...props}>
            {label}
        </StyledBadge>
    )
}

export default Badge
