import type { ComponentProps } from 'react'
import React from 'react'

import type { LocationDescriptor } from 'history'
import { Link } from 'react-router-dom'

import BaseCard from './BaseCard'

import css from './Card.less'

type Props<T> = {
    to: LocationDescriptor<T>
} & ComponentProps<typeof BaseCard>

function TemplateCardLink<T>({ to, ...props }: Props<T>) {
    return (
        <Link className={css.link} to={to}>
            <BaseCard className={css.templateCard} {...props} />
        </Link>
    )
}

export default TemplateCardLink
