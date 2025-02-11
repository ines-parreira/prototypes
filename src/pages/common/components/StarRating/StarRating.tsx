import React from 'react'
import ReactStars from 'react-rating-stars-component'

import {STAR_COLORS, DEFAULT_SIZE} from './constants'

type Props = {
    value: number
    size?: number
    isHalf?: boolean
    edit?: boolean
    onChange?: (value: number) => void
    emptyIcon?: React.ReactNode
    halfIcon?: React.ReactNode
    filledIcon?: React.ReactNode
    color?: string
    activeColor?: string
    classNames?: string
}

export default function StarRating({
    value,
    size = DEFAULT_SIZE,
    edit = false,
    emptyIcon = <span className={`material-icons`}>star</span>,
    halfIcon = <span className={`material-icons`}>star_half</span>,
    filledIcon = <span className={`material-icons`}>star</span>,
    color = STAR_COLORS.DEFAULT,
    activeColor = STAR_COLORS.ACTIVE,
    classNames,
}: Props) {
    return (
        <ReactStars
            value={value}
            size={size}
            edit={edit}
            emptyIcon={emptyIcon}
            halfIcon={halfIcon}
            filledIcon={filledIcon}
            color={color}
            activeColor={activeColor}
            classNames={classNames}
        />
    )
}
