import React, { ComponentProps, useMemo } from 'react'

import { parseToHsla } from 'color2k'

import { TicketTagDecorationProperty } from '@gorgias/api-types'

import { Tag } from 'components/Tag/Tag'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { THEME_NAME, useTheme } from 'core/theme'
import { getEnoughContrastedColor, isValidColor } from 'utils/colors'

type Props = {
    className?: string
    decoration?: TicketTagDecorationProperty
    text: string
    title?: string
} & ComponentProps<typeof Tag>

const TicketTag = ({
    text,
    className,
    decoration = {},
    title,
    ...props
}: Props) => {
    const theme = useTheme()
    const hasNewTag = useFlag(FeatureFlagKey.TagNewDesign)

    const tagColor = decoration?.color

    const color = tagColor && isValidColor(tagColor) ? tagColor.trim() : null

    const style = useMemo(() => {
        if (color) {
            const [hue, saturation] = parseToHsla(color)
            const backgroundColor = `hsla(${hue}, ${saturation * 100}%,`
            if (theme.resolvedName === THEME_NAME.Dark) {
                const textColorDark = getEnoughContrastedColor(
                    color,
                    `${backgroundColor} 10%)`,
                )

                return {
                    color: textColorDark,
                    backgroundColor: `${backgroundColor} 10%)`,
                }
            }
            return {
                color,
                backgroundColor: `${backgroundColor} 97%)`,
            }
        }
        return {}
    }, [color, theme])

    return (
        <Tag
            className={className}
            text={text}
            title={title}
            {...(hasNewTag
                ? {
                      customColor: color,
                  }
                : {
                      style,
                  })}
            {...props}
        />
    )
}

export default TicketTag
