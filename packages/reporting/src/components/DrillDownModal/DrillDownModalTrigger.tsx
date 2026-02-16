import type { PropsWithChildren } from 'react'

import { useId } from '@repo/hooks'
import classNames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { HINT_TOOLTIP_DELAY } from '../../constants'

import css from './DrillDownModalTrigger.less'

export const TRIGGER_ID = 'drill-down'

type Props = {
    tooltipText: string
    enabled?: boolean
    highlighted?: boolean
    openDrillDownModal: () => void
}

export const DrillDownModalTrigger = ({
    children,
    tooltipText,
    enabled = true,
    highlighted = false,
    openDrillDownModal,
}: PropsWithChildren<Props>) => {
    const targetId = `${TRIGGER_ID}-${useId()}`

    if (!enabled) return <>{children}</>

    return (
        <span
            id={targetId}
            className={classNames(css.text, {
                [css.highlighted]: highlighted,
            })}
            onClick={openDrillDownModal}
        >
            <Tooltip
                delay={HINT_TOOLTIP_DELAY}
                target={targetId}
                innerProps={{ boundariesElement: 'window' }}
                container={window.document.body}
            >
                {tooltipText}
            </Tooltip>
            {children}
        </span>
    )
}
