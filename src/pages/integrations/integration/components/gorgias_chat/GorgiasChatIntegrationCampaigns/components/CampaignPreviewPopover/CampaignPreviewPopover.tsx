import React, {
    ReactNode,
    cloneElement,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {Popover} from 'reactstrap'
import _uniqBy from 'lodash/uniqBy'

import {TRIGGER_LIST} from '../../constants/triggers'
import {CampaignTrigger} from '../../types/CampaignTrigger'

import css from './style.less'

type Props = {
    children: ReactNode
    message: string
    triggers: CampaignTrigger[]
}

const getTriggerLabel = (trigger: CampaignTrigger): string => {
    return TRIGGER_LIST.find((item) => item.key === trigger.key)?.label ?? ''
}

export const CampaignPreviewPopover = ({
    children,
    message,
    triggers,
}: Props) => {
    const innerRef = useRef<HTMLSpanElement>(null)
    const [isOpen, setOpen] = useState<boolean>(false)

    const uniqueTriggers = useMemo(() => {
        return _uniqBy(triggers, 'key')
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
            >
                <div className={css.container}>
                    <p className={css.title}>Message</p>
                    <p className={css.message}>{message}</p>
                    <div className={css.divider} />
                    <p className={css.title}>Triggers</p>
                    <ul className={css.triggersList}>
                        {uniqueTriggers.map((trigger) => (
                            <li key={trigger.key} className={css.triggerItem}>
                                {getTriggerLabel(trigger)}
                            </li>
                        ))}
                    </ul>
                </div>
            </Popover>
            {cloneElement(children as any, {ref: innerRef})}
        </>
    )
}
