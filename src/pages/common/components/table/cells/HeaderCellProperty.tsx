import React, {HTMLProps, ReactNode, useRef} from 'react'
import classnames from 'classnames'

import StatsHelpIcon from 'pages/stats/common/components/StatsHelpIcon'

import {OrderDirection} from '../../../../../models/api/types'

import Tooltip from '../../Tooltip'

import HeaderCell from './HeaderCell'
import css from './HeaderCellProperty.less'

type Props = Omit<HTMLProps<HTMLTableCellElement>, 'size'> & {
    children?: ReactNode
    className?: string
    direction?: Maybe<OrderDirection>
    isOrderedBy?: boolean
    onClick?: () => void
    title: string
    tooltip?: ReactNode
}

export default function HeaderCellProperty({
    children,
    className,
    direction,
    isOrderedBy,
    onClick,
    title,
    tooltip,
    ...otherProps
}: Props) {
    const tooltipRef = useRef<HTMLElement>(null)

    return (
        <HeaderCell
            {...otherProps}
            className={classnames(className)}
            onClick={onClick}
        >
            <div className={css.content}>
                {children}
                <div className={css.cell}>
                    <span className={css.title}>{title}</span>
                    {tooltip && (
                        <span>
                            <StatsHelpIcon ref={tooltipRef} />
                            <Tooltip target={tooltipRef}>{tooltip}</Tooltip>
                        </span>
                    )}
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
