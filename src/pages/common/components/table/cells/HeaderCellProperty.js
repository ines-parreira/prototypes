//@flow
import classnames from 'classnames'
import React, {type Node as ReactNode} from 'react'

import {ORDER_DIRECTION, type OrderDirection} from '../../../../../models/api'

import HeaderCell from './HeaderCell'
import css from './HeaderCellProperty.less'

type Props = $Exact<{
    ...HTMLTableCellElement,
    children?: ReactNode,
    className?: string,
    direction?: OrderDirection,
    isOrderedBy?: boolean,
    onClick?: () => void,
    title: string,
}>

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
                {(children: any)}
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
                        {direction === ORDER_DIRECTION.ASC
                            ? 'arrow_drop_down'
                            : 'arrow_drop_up'}
                    </i>
                </div>
            </div>
        </HeaderCell>
    )
}
