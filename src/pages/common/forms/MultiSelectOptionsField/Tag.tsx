import React, {MouseEvent} from 'react'
import {Badge} from 'reactstrap'
import classnames from 'classnames'

import css from './Tag.less'
import {Option} from './types'

const SPACE_SYMBOL = `␣`

type Props = {
    option: Option
    onRemove: (option: Option) => void
    isCompact?: boolean
    symbolSpaces?: boolean
}

export default function Tag({
    option,
    onRemove,
    isCompact,
    symbolSpaces,
}: Props) {
    const label = symbolSpaces
        ? option.label.replace(/ /g, SPACE_SYMBOL)
        : option.label

    return (
        <Badge
            className={classnames(css.tag, {
                [css.compact]: isCompact,
            })}
        >
            <span className={css.tagText}>{option.displayLabel || label}</span>
            <i
                className={classnames('material-icons ml-1', css.closeIcon)}
                onClick={(event: MouseEvent) => {
                    event.stopPropagation()
                    event.preventDefault()
                    onRemove(option)
                }}
            >
                close
            </i>
        </Badge>
    )
}
