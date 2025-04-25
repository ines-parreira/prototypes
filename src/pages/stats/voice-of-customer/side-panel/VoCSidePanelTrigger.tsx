import { PropsWithChildren } from 'react'

import classNames from 'classnames'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useId from 'hooks/useId'
import { hintTooltipDelay } from 'pages/stats/common/constants'
import css from 'pages/stats/voice-of-customer/side-panel/VoCSidePanelTrigger.less'
import { setSidePanelData } from 'state/ui/stats/sidePanelSlice'

type Props = {
    children: React.ReactNode
    tooltipText?: string
    enabled?: boolean
    highlighted?: boolean
    productId: string
    segmentEventName?: SegmentEvent
}

export const TRIGGER_ID = 'voc-side-panel'

export const VoCSidePanelTrigger = ({
    children,
    tooltipText,
    enabled = true,
    highlighted = false,
    productId,
    segmentEventName = SegmentEvent.StatClicked,
}: PropsWithChildren<Props>) => {
    const dispatch = useAppDispatch()

    const targetId = `${TRIGGER_ID}-${useId()}`

    const handleClick = () => {
        dispatch(setSidePanelData(productId))
        logEvent(segmentEventName, { product: productId })
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
