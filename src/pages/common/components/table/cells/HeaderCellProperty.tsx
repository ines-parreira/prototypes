import classnames from 'classnames'
import React, {HTMLProps, ReactNode, useRef} from 'react'

import StatsHelpIcon from 'pages/stats/common/components/StatsHelpIcon'

import {OrderDirection} from '../../../../../models/api/types'

import Tooltip from '../../Tooltip'

import HeaderCell from './HeaderCell'
import css from './HeaderCellProperty.less'

type Props = Omit<HTMLProps<HTMLTableCellElement>, 'size'> & {
    children?: ReactNode
    className?: string
    titleClassName?: string
    direction?: Maybe<OrderDirection>
    isOrderedBy?: boolean
    onClick?: () => void
    title: string
    tooltip?: ReactNode
    justifyContent?: 'left' | 'right' | 'center'
    wrapContent?: boolean
    width?: number | string
}

export default function HeaderCellProperty({
    children,
    className,
    titleClassName,
    direction,
    isOrderedBy,
    onClick,
    title,
    tooltip,
    justifyContent,
    wrapContent = false,
    ...otherProps
}: Props) {
    const tooltipRef = useRef<HTMLElement>(null)

    return (
        <HeaderCell
            {...otherProps}
            className={classnames(className)}
            onClick={onClick}
        >
            <div
                className={classnames(
                    css.content,
                    justifyContent && css[justifyContent],
                    {
                        [css.wrapContent]: wrapContent,
                    }
                )}
            >
                {children}
                <div
                    className={classnames(
                        css.cell,
                        justifyContent && css[justifyContent]
                    )}
                >
                    <span className={classnames(css.title, titleClassName)}>
                        {title}
                    </span>
                    {tooltip && (
                        <span>
                            <StatsHelpIcon ref={tooltipRef} />
                            <Tooltip target={tooltipRef} autohide={false}>
                                {tooltip}
                            </Tooltip>
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
                            ? 'arrow_downward'
                            : 'arrow_upward'}
                    </i>
                </div>
            </div>
        </HeaderCell>
    )
}
