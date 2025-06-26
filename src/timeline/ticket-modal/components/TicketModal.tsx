import { TicketCompact } from '@gorgias/helpdesk-queries'
import { Button, IconButton } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import { Drawer } from 'components/Drawer/Drawer'
import { FeatureFlagKey } from 'config/featureFlags'
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

    if (!ticketId) return null

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
                                trailingIcon="open_in_new"
                                onClick={() => {
                                    logEvent(
                                        SegmentEvent.CustomerTimelineModalViewTicketClicked,
                                    )
                                }}
                            >
                                View Ticket
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
            classNameDialog={css.dialog}
            isOpen
            onClose={onClose}
            forceFocus
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
                    trailingIcon="open_in_new"
                    onClick={() => {
                        logEvent(
                            SegmentEvent.CustomerTimelineModalViewTicketClicked,
                        )
                    }}
                >
                    View Ticket
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
