import { TicketCompact } from '@gorgias/helpdesk-queries'
import { Button, IconButton } from '@gorgias/merchant-ui-kit'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import { TicketDetail } from 'tickets/ticket-detail/components/TicketDetail'

import { TicketModalProvider } from './TicketModalProvider'

import css from './TicketModal.less'

type Props = {
    summary?: TicketCompact
    ticketId: number
    onClose: () => void
    onNext?: () => void
    onPrevious?: () => void
}

export function TicketModal({
    summary,
    ticketId,
    onClose,
    onNext,
    onPrevious,
}: Props) {
    return (
        <Modal
            classNameContent={css.content}
            classNameDialog={css.dialog}
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
