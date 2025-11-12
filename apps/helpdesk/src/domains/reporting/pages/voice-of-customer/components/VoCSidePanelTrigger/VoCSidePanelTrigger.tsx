import { PropsWithChildren } from 'react'

import { useId } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { hintTooltipDelay } from 'domains/reporting/pages/common/constants'
import css from 'domains/reporting/pages/voice-of-customer/components/VoCSidePanelTrigger/VoCSidePanelTrigger.less'
import {
    setSidePanelData,
    SidePanelProduct,
} from 'domains/reporting/state/ui/stats/sidePanelSlice'
import useAppDispatch from 'hooks/useAppDispatch'

type Props = {
    children: React.ReactNode
    tooltipText?: string
    enabled?: boolean
    highlighted?: boolean
    product: SidePanelProduct
    segmentEventName?: SegmentEvent
}

export const TRIGGER_ID = 'voc-side-panel'

export const VoCSidePanelTrigger = ({
    children,
    tooltipText,
    enabled = true,
    highlighted = false,
    product,
    segmentEventName = SegmentEvent.StatClicked,
}: PropsWithChildren<Props>) => {
    const dispatch = useAppDispatch()

    const targetId = `${TRIGGER_ID}-${useId()}`

    const handleClick = () => {
        dispatch(setSidePanelData(product))
        logEvent(segmentEventName, { product: product.id })
    }

    return (
        <>
            {enabled ? (
                <span
                    id={targetId}
                    className={classNames(css.text, {
                        [css.highlighted]: highlighted,
                    })}
                    onClick={handleClick}
                >
                    {tooltipText && (
                        <Tooltip delay={hintTooltipDelay} target={targetId}>
                            {tooltipText}
                        </Tooltip>
                    )}
                    {children}
                </span>
            ) : (
                children
            )}
        </>
    )
}
