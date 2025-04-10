import { Button } from '@gorgias/merchant-ui-kit'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import { TicketDetail } from 'tickets/ticket-detail'

import css from './TimelineTicketModal.less'

type Props = {
    ticketId: number
    onClose: () => void
    onNext?: () => void
    onPrevious?: () => void
}

export function TimelineTicketModal({
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
            <ModalBody className={css.body}>
                <TicketDetail ticketId={ticketId} />
            </ModalBody>
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
