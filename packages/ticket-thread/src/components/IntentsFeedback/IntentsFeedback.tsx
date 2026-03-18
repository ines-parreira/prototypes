import { useEffect, useMemo, useRef, useState } from 'react'

import { useTimeout } from '@repo/hooks'
import { humanize } from '@repo/utils'
import { createPortal } from 'react-dom'

import { Icon } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'
import type { TicketMessage } from '@gorgias/helpdesk-queries'
import type { TicketMessageIntent } from '@gorgias/helpdesk-types'

import { useSaveMessageIntents } from '../../hooks/shared/useSaveMessageIntents'
import { AvailableIntentRow } from './AvailableIntentRow'

import css from './IntentsFeedback.less'

const MAX_ACTIVE_INTENTS = 3

type IntentsFeedbackProps = {
    message: TicketMessage
}

function getActiveIntentNames(
    intents: TicketMessageIntent[],
    allIntentNames: string[],
): string[] {
    const activeNames = intents
        .filter((intent) => !intent.rejected)
        .map((intent) => intent.name)
    return allIntentNames.filter((name) => activeNames.includes(name))
}

export function IntentsFeedback({ message }: IntentsFeedbackProps) {
    const allIntents = useMemo<Record<string, string>>(
        () =>
            (
                window as unknown as {
                    GORGIAS_CONSTANTS?: { INTENTS?: Record<string, string> }
                }
            ).GORGIAS_CONSTANTS?.INTENTS ?? {},
        [],
    )
    const allIntentNames = useMemo(() => Object.keys(allIntents), [allIntents])

    const { ticket_id: ticketId = 0, id: messageId = 0, intents = [] } = message

    const messageIntentNames = useMemo(
        () => getActiveIntentNames(intents, allIntentNames),
        [intents, allIntentNames],
    )

    const [activeIntentsNames, setActiveIntentsNames] =
        useState<string[]>(messageIntentNames)
    const [isOpen, setIsOpen] = useState(false)
    const [panelPosition, setPanelPosition] = useState({ top: 0, right: 0 })
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [setCloseTimeout, clearCloseTimeout] = useTimeout()

    useEffect(() => {
        setActiveIntentsNames(messageIntentNames)
    }, [messageIntentNames])

    useEffect(() => {
        if (isOpen && wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect()
            setPanelPosition({
                top: rect.bottom + 4,
                right: window.innerWidth - rect.right,
            })
        }
    }, [isOpen])

    const hasUnsavedIntents = useMemo(() => {
        const prev = getActiveIntentNames(intents, allIntentNames)
        return (
            JSON.stringify([...prev].sort()) !==
            JSON.stringify([...activeIntentsNames].sort())
        )
    }, [intents, allIntentNames, activeIntentsNames])

    const { mutate: saveIntents } = useSaveMessageIntents()

    const handleClose = () => {
        if (hasUnsavedIntents) {
            saveIntents({
                ticketId,
                messageId,
                activeIntents: activeIntentsNames,
            })
        }
        setIsOpen(false)
    }

    const scheduleClose = () => {
        setCloseTimeout(handleClose, 100)
    }

    const cancelClose = () => {
        clearCloseTimeout()
    }

    const availableIntentsNames = useMemo(
        () =>
            allIntentNames.filter((name) => !activeIntentsNames.includes(name)),
        [allIntentNames, activeIntentsNames],
    )

    const numActive = activeIntentsNames.length
    const label =
        numActive === 0
            ? 'No intents detected'
            : numActive === 1
              ? activeIntentsNames[0]
              : `${numActive} intents detected`

    return (
        <div
            ref={wrapperRef}
            className={css.wrapper}
            onMouseLeave={scheduleClose}
            onMouseEnter={cancelClose}
        >
            <button
                type="button"
                className={css.trigger}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Message intent"
            >
                <Icon name={'folder-document' as IconName} size="sm" />
            </button>
            {isOpen &&
                createPortal(
                    <div
                        className={css.panel}
                        style={{
                            position: 'fixed',
                            top: panelPosition.top,
                            right: panelPosition.right,
                        }}
                        onMouseEnter={cancelClose}
                        onMouseLeave={scheduleClose}
                    >
                        <div className={css.header}>Message intents</div>
                        <div className={css.options}>
                            <div className={css.subheader}>{label}</div>
                            {activeIntentsNames.map((name) => (
                                <div key={name} className={css.intentRow}>
                                    <div className={css.intentLabel}>
                                        <span className={css.action}>
                                            <button
                                                className={`${css.actionButton} ${css.rejectButton}`}
                                                onClick={() =>
                                                    setActiveIntentsNames(
                                                        activeIntentsNames.filter(
                                                            (n) => n !== name,
                                                        ),
                                                    )
                                                }
                                                type="button"
                                                aria-label={`Remove ${name}`}
                                            >
                                                <Icon
                                                    name={'close' as IconName}
                                                    size="xs"
                                                />
                                            </button>
                                        </span>
                                        <span className={css.label}>
                                            {humanize(name)}
                                        </span>
                                    </div>
                                    {allIntents[name] && (
                                        <div
                                            className={css.description}
                                            title={allIntents[name]}
                                        >
                                            {allIntents[name]}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className={css.divider} />
                            <div className={css.subheader}>Other intents</div>
                            {availableIntentsNames.map((name) => (
                                <AvailableIntentRow
                                    key={name}
                                    name={name}
                                    description={allIntents[name]}
                                    isDisabled={numActive >= MAX_ACTIVE_INTENTS}
                                    onAdd={() =>
                                        setActiveIntentsNames(
                                            [
                                                ...activeIntentsNames,
                                                name,
                                            ].sort(),
                                        )
                                    }
                                />
                            ))}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    )
}
