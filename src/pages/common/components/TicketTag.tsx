import React, {ComponentProps, useContext, useMemo} from 'react'
import {fromJS, Map} from 'immutable'
import {parseToHsla, readableColor} from 'color2k'
import _trim from 'lodash/trim'

import Tag from 'components/Tag'
import {Theme, ThemeContext} from 'theme'
import {getEnoughContrastedColor, isValidColor} from 'utils/colors'

type Props = {
    className?: string
    decoration?: Map<any, any>
    text: string
    title?: string
} & ComponentProps<typeof Tag>

const TicketTag = ({text, className, decoration, title, ...props}: Props) => {
    const context = useContext(ThemeContext)

    const tagColor = ((decoration || fromJS({})) as Map<any, any>).get(
        'color'
    ) as string | null

    const color = tagColor && isValidColor(tagColor) ? tagColor : null

    const style = useMemo(() => {
        if (color) {
            if (context?.theme === Theme.Dark) {
                const [hue, saturation] = parseToHsla(_trim(color))
                const backgroundColor = `hsla(${hue}, ${saturation * 100}%,`
                const textColorDark = getEnoughContrastedColor(
                    color,
                    `${backgroundColor} 10%)`
                )

                return {
                    color: textColorDark,
                    backgroundColor: `${backgroundColor} 10%)`,
                }
            }
            return {
                color: readableColor(color.trim()),
                backgroundColor: color,
            }
        }
        return {}
    }, [color, context?.theme])

    return (
        <Tag
            className={className}
            style={style}
            text={text}
            title={title}
            {...props}
        />
    )
}

export default TicketTag
