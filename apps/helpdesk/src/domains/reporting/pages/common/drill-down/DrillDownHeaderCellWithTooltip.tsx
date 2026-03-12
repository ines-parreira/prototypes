import type { ReactNode } from 'react'
import { isValidElement } from 'react'

import classnames from 'classnames'

import { Icon, Tooltip, TooltipContent } from '@gorgias/axiom'

import { HintTooltipContent } from 'domains/reporting/pages/common/HintTooltip'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import css from 'pages/common/components/table/cells/HeaderCellProperty.less'

type Props = {
    title: string
    tooltip?: ReactNode
    width?: number | string
    className?: string
    titleClassName?: string
}

export function DrillDownHeaderCellWithTooltip({
    title,
    tooltip,
    width,
    className,
    titleClassName,
}: Props) {
    return (
        <HeaderCell width={width} className={className}>
            <div className={css.content}>
                <div className={css.cell}>
                    <span className={classnames(css.title, titleClassName)}>
                        {title}
                    </span>
                    {tooltip &&
                        (() => {
                            const icon = <Icon name="info" size="sm" />

                            if (typeof tooltip === 'string') {
                                return (
                                    <Tooltip placement="top" trigger={icon}>
                                        <TooltipContent caption={tooltip} />
                                    </Tooltip>
                                )
                            }

                            // Handle HintTooltipContent ReactElement
                            if (
                                isValidElement(tooltip) &&
                                tooltip.type === HintTooltipContent
                            ) {
                                const { title, link, linkText } =
                                    tooltip.props as {
                                        title: string | ReactNode
                                        link?: string
                                        linkText?: string
                                    }
                                return (
                                    <Tooltip placement="top" trigger={icon}>
                                        <TooltipContent
                                            title={
                                                typeof title === 'string'
                                                    ? title
                                                    : ''
                                            }
                                            link={
                                                link ? (
                                                    <a
                                                        href={link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {linkText ||
                                                            'Learn more'}
                                                    </a>
                                                ) : undefined
                                            }
                                        />
                                    </Tooltip>
                                )
                            }

                            // Fallback for other ReactNode types
                            return (
                                <Tooltip placement="top" trigger={icon}>
                                    <TooltipContent caption={String(tooltip)} />
                                </Tooltip>
                            )
                        })()}
                </div>
            </div>
        </HeaderCell>
    )
}
