import { HTMLProps, ReactNode } from 'react'

import classnames from 'classnames'

import { OrderDirection } from 'models/api/types'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import css from 'pages/common/components/table/cells/HeaderCellProperty.less'
import IconTooltip, {
    IconTooltipProps,
} from 'pages/common/forms/IconTooltip/IconTooltip'

type Props = Omit<HTMLProps<HTMLTableCellElement>, 'size'> & {
    children?: ReactNode
    className?: string
    titleClassName?: string
    direction?: Maybe<OrderDirection>
    isOrderedBy?: boolean
    isSticky?: boolean
    onClick?: () => void
    title: string
    tooltip?: ReactNode
    justifyContent?: 'left' | 'right' | 'center'
    wrapContent?: boolean
    width?: number | string
    height?: 'comfortable' | 'compact'
}

const tooltipProps: IconTooltipProps['tooltipProps'] = {
    innerProps: { boundariesElement: 'window' },
    autohide: false,
    placement: 'top-start',
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
    isSticky = false,
    ...otherProps
}: Props) {
    return (
        <HeaderCell
            {...otherProps}
            className={classnames(className, { [css.withShadow]: isSticky })}
            onClick={onClick}
        >
            <div
                className={classnames(
                    css.content,
                    justifyContent && css[justifyContent],
                    {
                        [css.wrapContent]: wrapContent,
                    },
                )}
            >
                {children}
                <div
                    className={classnames(
                        css.cell,
                        justifyContent && css[justifyContent],
                    )}
                >
                    <span className={classnames(css.title, titleClassName)}>
                        {title}
                    </span>
                    {tooltip && (
                        <IconTooltip
                            tooltipProps={tooltipProps}
                            className={css.tooltip}
                        >
                            {tooltip}
                        </IconTooltip>
                    )}
                    <i
                        className={classnames(
                            'material-icons md-1',
                            css.directionIcon,
                            {
                                [css.isVisible]: isOrderedBy,
                            },
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
