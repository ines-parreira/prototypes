import classnames from 'classnames'
import React, {HTMLProps, ReactNode} from 'react'

import {OrderDirection} from '../../../../../models/api/types'

import HeaderCell from './HeaderCell'
import css from './HeaderCellProperty.less'

type Props = HTMLProps<HTMLTableCellElement> & {
    children?: ReactNode
    className?: string
    direction?: Maybe<OrderDirection>
    isOrderedBy?: boolean
    onClick?: () => void
    title: string
}

export default function HeaderCellProperty({
    children,
    className,
    direction,
    isOrderedBy,
    onClick,
    title,
    ...otherProps
}: Props) {
    return (
        <HeaderCell
            {...otherProps}
            className={classnames(className)}
            onClick={onClick}
        >
            <div className={css.content}>
                {children}
                <div>
                    <span className={css.title}>{title}</span>
                    <i
                        className={classnames(
                            'material-icons md-1',
                            css.directionIcon,
                            {
                                [css.isVisible]: isOrderedBy,
                            }
                        )}
                    >
                        {direction === OrderDirection.Asc
                            ? 'arrow_drop_down'
                            : 'arrow_drop_up'}
                    </i>
                </div>
            </div>
        </HeaderCell>
    )
}
