import type { ReactNode } from 'react'
import { useRef } from 'react'

import { Icon, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { HINT_TOOLTIP_DELAY } from '../../constants'
import type { TooltipData } from '../../types'
import { HintTooltip } from '../HintTooltip/HintTooltip'

import css from './MetricCardHeader.less'

export function MetricCardHeader({
    title,
    hint,
    titleExtra,
    actionMenu,
}: {
    title: ReactNode
    hint?: TooltipData
    titleExtra?: ReactNode
    actionMenu?: ReactNode
}) {
    const targetRef = useRef<HTMLDivElement>(null)

    return (
        <div className={css.wrapper}>
            <div className={css.title}>
                {title}
                {hint && (
                    <>
                        <Icon name="info" ref={targetRef} />
                        <Tooltip
                            target={targetRef}
                            innerProps={{
                                innerClassName: css.innerTooltip,
                                boundariesElement: 'window',
                            }}
                            delay={HINT_TOOLTIP_DELAY}
                            placement="top-start"
                            autohide={false}
                        >
                            <HintTooltip hint={hint} />
                        </Tooltip>
                    </>
                )}
            </div>
            <div className={css.actionMenu}>
                {titleExtra}
                {actionMenu}
            </div>
        </div>
    )
}
