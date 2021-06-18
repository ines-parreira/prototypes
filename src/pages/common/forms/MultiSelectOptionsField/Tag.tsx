import React, {MouseEvent} from 'react'
import {Badge} from 'reactstrap'

import css from './Tag.less'
import {Option} from './types'

type Props = {
    option: Option
    color: string
    onRemove: (option: Option) => void
}

export default function Tag({option, color, onRemove}: Props) {
    return (
        <Badge
            className={css.tag}
            style={{
                color,
            }}
        >
            <span>
                {option.displayLabel || option.label}
                <i
                    className="material-icons ml-1"
                    onClick={(event: MouseEvent) => {
                        event.stopPropagation()
                        event.preventDefault()
                        onRemove(option)
                    }}
                >
                    close
                </i>
            </span>
        </Badge>
    )
}
