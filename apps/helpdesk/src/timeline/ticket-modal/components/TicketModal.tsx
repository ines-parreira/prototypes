import { useCallback, useEffect, useRef } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import cn from 'classnames'
import { useHistory } from 'react-router-dom'

import {
    LegacyButton as Button,
    LegacyIconButton as IconButton,
} from '@gorgias/axiom'
import { TicketCompact } from '@gorgias/helpdesk-queries'

import { Drawer } from 'components/Drawer/Drawer'
import { useFlag } from 'core/flags'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import { TicketDetail } from 'tickets/ticket-detail/components/TicketDetail'

import { useTicketModal } from '../hooks/useTicketModal'
import { TicketModalProvider } from './TicketModalProvider'

import css from './TicketModal.less'

type Props = {
    summary?: TicketCompact
    containerRef?: React.RefObject<HTMLDivElement>
} & Omit<ReturnType<typeof useTicketModal>, 'onOpen'>

export function TicketModal({
    summary,
    ticketId,
    onClose,
    onNext,
    onPrevious,
    containerRef,
}: Props) {
    const hasCTDrawerUX = useFlag(FeatureFlagKey.CustomerTimelineDrawerUX)
    const closeButtonRef = useRef<HTMLButtonElement>(null)
    const history = useHistory()

    const handleExpandTicketClick = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement>) => {
            logEvent(SegmentEvent.CustomerTimelineModalViewTicketClicked)
            if (!event.metaKey) {
                event.preventDefault()
                history.push(`/app/ticket/${ticketId}`)
            }
        },
        [history, ticketId],
    )

    useEffect(() => {
        if (closeButtonRef.current) {
            closeButtonRef.current.focus()
        }
    }, [])

    if (!ticketId) return null

    const expandTicketIcon = (
        <i className={`material-icons ${css.expandTicketIcon}`}>
            open_in_full_right
        </i>
    )

    if (hasCTDrawerUX) {
        return (
            <Drawer.NestedRoot
                open
                direction="right"
                handleOnly
                container={containerRef?.current}
            >
                <Drawer.Content className={css.ticketDrawer}>
                    <div className={css.ticketDrawerContent}>
                        <TicketModalProvider>
                            {ticketId && (
                                <TicketDetail
                                    summary={summary}
                                    ticketId={ticketId}
                                    additionalHeaderActions={
                                        <IconButton
                                            fillStyle="ghost"
                                            icon="close"
                                            intent="secondary"
                                            onClick={onClose}
                                            ref={closeButtonRef}
                                        />
                                    }
                                />
                            )}
                        </TicketModalProvider>
                        <ModalFooter className={css.ticketDrawerFooter}>
                            <div>
                                <Button
                                    fillStyle="ghost"
                                    intent="primary"
                                    isDisabled={!onPrevious}
                                    leadingIcon="chevron_left"
                                    onClick={onPrevious}
                                >
                                    Previous
                                </Button>
                                <Button
                                    fillStyle="ghost"
                                    intent="primary"
                                    isDisabled={!onNext}
                                    trailingIcon="chevron_right"
                                    onClick={onNext}
                                >
                                    Next
                                </Button>
                            </div>
                            <Button
                                as="a"
                                fillStyle="ghost"
                                href={`/app/ticket/${ticketId}`}
                                intent="secondary"
                                rel="noreferrer"
                                target="_blank"
                                trailingIcon={expandTicketIcon}
                                onClick={handleExpandTicketClick}
                            >
                                Expand Ticket
                            </Button>
                        </ModalFooter>
                    </div>
                </Drawer.Content>
            </Drawer.NestedRoot>
        )
    }

    return (
        <Modal
            classNameContent={css.content}
            classNameDialog={cn(css.dialog, 'shortcuts-enable')}
            isOpen
            onClose={onClose}
        >
            <TicketModalProvider>
                <ModalBody className={css.body}>
                    <TicketDetail
                        summary={summary}
                        ticketId={ticketId}
                        additionalHeaderActions={
                            <IconButton
                                fillStyle="ghost"
                                icon="close"
                                intent="secondary"
                                onClick={onClose}
                                ref={closeButtonRef}
                            />
                        }
                    />
                </ModalBody>
            </TicketModalProvider>
            <ModalFooter className={css.footer}>
                <Button
                    as="a"
                    fillStyle="ghost"
                    href={`/app/ticket/${ticketId}`}
                    intent="secondary"
                    rel="noreferrer"
                    target="_blank"
                    trailingIcon={expandTicketIcon}
                    onClick={handleExpandTicketClick}
                >
                    Expand Ticket
                </Button>
                <div>
                    <Button
                        fillStyle="ghost"
                        intent="primary"
                        isDisabled={!onPrevious}
                        leadingIcon="chevron_left"
                        onClick={onPrevious}
                    >
                        Previous
                    </Button>
                    <Button
                        fillStyle="ghost"
                        intent="primary"
                        isDisabled={!onNext}
                        trailingIcon="chevron_right"
                        onClick={onNext}
                    >
                        Next
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    )
}
