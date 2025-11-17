import type { ReactNode } from 'react'
import React, {
    cloneElement,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import _uniqBy from 'lodash/uniqBy'
import { Popover } from 'reactstrap'

import { useAppNode } from 'appNode'

import { TRIGGERS_CONFIG } from '../../constants/triggers'
import type { CampaignTrigger } from '../../types/CampaignTrigger'
import { CampaignTriggerType } from '../../types/enums/CampaignTriggerType.enum'

import css from './style.less'

type Props = {
    children: ReactNode
    message: string
    triggers: CampaignTrigger[]
}

const getTriggerLabel = (trigger: CampaignTrigger): string => {
    return TRIGGERS_CONFIG[trigger.type].label
}

export const CampaignPreviewPopover = ({
    children,
    message,
    triggers,
}: Props) => {
    const innerRef = useRef<HTMLSpanElement>(null)
    const [isOpen, setOpen] = useState<boolean>(false)
    const appNode = useAppNode()

    const uniqueTriggers = useMemo(() => {
        return _uniqBy(triggers, 'type').filter((trigger) => {
            const noShowTriggers = [
                CampaignTriggerType.SingleInView,
                CampaignTriggerType.DeviceType,
            ]
            return !noShowTriggers.includes(trigger.type)
        })
    }, [triggers])

    useEffect(() => {
        const node = innerRef.current
        let timeout: NodeJS.Timeout

        const handleEvent = (event: Event): void => {
            if (node) {
                if (node.contains(event.target as Node)) {
                    timeout = setTimeout(() => setOpen(true), 800)
                } else {
                    setOpen(false)
                }
            }
        }

        const hideModal = (): void => {
            clearTimeout(timeout)
            setOpen(false)
        }

        if (node) {
            node.addEventListener('mouseover', handleEvent)
            node.addEventListener('mouseout', hideModal)
        }

        return () => {
            document.removeEventListener('mouseover', handleEvent)
        }
    }, [innerRef])

    return (
        <>
            <Popover
                target={innerRef}
                placement="top-start"
                isOpen={isOpen}
                hideArrow
                popperClassName={css.popover}
                innerClassName={css.content}
                container={appNode ?? undefined}
            >
                <div className={css.container}>
                    <p className={css.title}>Message</p>
                    <p className={css.message}>{message}</p>
                    <div className={css.divider} />
                    <p className={css.title}>Triggers</p>
                    <ul className={css.triggersList}>
                        {uniqueTriggers.map((trigger) => (
                            <li key={trigger.type} className={css.triggerItem}>
                                {getTriggerLabel(trigger)}
                            </li>
                        ))}
                    </ul>
                </div>
            </Popover>
            {cloneElement(children as any, { ref: innerRef })}
        </>
    )
}
