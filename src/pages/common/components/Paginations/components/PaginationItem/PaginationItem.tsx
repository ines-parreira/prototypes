import classNames from 'classnames'
import React from 'react'

import {NavigationSize} from '../../types/NavigationSize'
import {PageType, isPageType} from '../../types/PageType'

import css from './PaginationItem.less'

type Props = {
    className?: string
    page: number | null
    selected?: boolean
    disabled?: boolean
    itemId?: string
    size?: NavigationSize
    type: PageType
    onClick: () => void
}

export const PaginationItem = ({
    className: innerClassName,
    page,
    selected = false,
    disabled = false,
    itemId,
    size = 'medium',
    type,
    onClick,
}: Props) => {
    const className = classNames(css.item, innerClassName, {
        [css.ellipsis]: type === 'start-ellipsis' || type === 'end-ellipsis',
        [css.small]: size === 'small',
        [css.arrow]: type === 'next' || type === 'previous',
        [css.selected]: selected,
        [css.disabled]: disabled,
    })

    if (!isPageType(type)) {
        return null
    }

    if (type === 'start-ellipsis' || type === 'end-ellipsis') {
        return (
            <li aria-label={type} className={className}>
                <span>...</span>
            </li>
        )
    }
    if (type === 'next' || type === 'previous') {
        return (
            <li
                aria-label={type}
                className={className}
                onClick={onClick}
                id={itemId}
            >
                {type === 'next' && (
                    <i className="material-icons md-2">keyboard_arrow_right</i>
                )}
                {type === 'previous' && (
                    <i className="material-icons md-2">keyboard_arrow_left</i>
                )}
            </li>
        )
    }

    return (
        <li
            className={className}
            aria-label={`page-${page as number}`}
            aria-current={selected}
            onClick={onClick}
        >
            {page}
        </li>
    )
}
