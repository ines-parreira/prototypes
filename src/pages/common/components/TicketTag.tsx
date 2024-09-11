import React, {HTMLAttributes, useContext, useMemo} from 'react'
import classNames from 'classnames'
import {fromJS, Map} from 'immutable'
import {parseToHsla, readableColor} from 'color2k'
import colors from '@gorgias/design-tokens/dist/tokens/color/merchantLight.json'
import _trim from 'lodash/trim'

import {getEnoughContrastedColor, isValidColor} from 'utils/colors'
import {Theme, ThemeContext} from 'theme'

import css from './TicketTag.less'

type Props = {
    className?: string
    decoration?: Map<any, any>
    title?: string
} & HTMLAttributes<HTMLDivElement>

const TicketTag = ({children, className, decoration, title}: Props) => {
    const context = useContext(ThemeContext)

    const tagColor = ((decoration || fromJS({})) as Map<any, any>).get(
        'color'
    ) as string | null

    const color =
        tagColor && isValidColor(tagColor)
            ? tagColor
            : context?.colorTokens?.Main.Secondary.value ??
              colors.Light.Main.Secondary.value

    const [hue, saturation] = useMemo(() => parseToHsla(_trim(color)), [color])
    const backgroundColor = `hsla(${hue}, ${saturation * 100}%,`
    const textColorDark = useMemo(
        () => getEnoughContrastedColor(color, `${backgroundColor} 10%)`),
        [backgroundColor, color]
    )

    return (
        <div
            className={classNames(css.badge, className)}
            style={
                context?.theme === Theme.Dark
                    ? {
                          color: textColorDark,
                          backgroundColor: `${backgroundColor} 10%)`,
                      }
                    : {
                          color: readableColor(color),
                          backgroundColor: color,
                      }
            }
            title={title}
        >
            {children}
        </div>
    )
}

export default TicketTag
