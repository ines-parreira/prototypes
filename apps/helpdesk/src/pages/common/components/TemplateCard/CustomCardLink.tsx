import React, { ComponentProps } from 'react'

import { LocationDescriptor } from 'history'
import { Link } from 'react-router-dom'

import BaseCard from './BaseCard'

import css from './Card.less'

type Props<T> = {
    to: LocationDescriptor<T>
} & ComponentProps<typeof BaseCard>

function CustomCardLink<T>({ to, ...props }: Props<T>) {
    return (
        <Link className={css.link} to={to}>
            <BaseCard
                icon={<i className="material-icons">add_circle</i>}
                {...props}
            />
        </Link>
    )
}

export default CustomCardLink
