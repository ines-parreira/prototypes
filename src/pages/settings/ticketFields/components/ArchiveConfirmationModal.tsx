import React from 'react'
import {ConfirmationModal} from 'pages/settings/helpCenter/components/ConfirmationModal'

export type Props = {
    ticketFieldLabel: string
    isOpen: boolean
    onConfirm: () => void
    onClose: () => void
}

export default function ArchiveConfirmationModal({
    ticketFieldLabel,
    isOpen,
    onConfirm,
    onClose,
}: Props) {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            title="Archive ticket field"
            confirmText="Archive"
            confirmIntent="primary"
            onConfirm={onConfirm}
            onClose={onClose}
        >
            <p>
                Archiving <b>{ticketFieldLabel}</b> will make it unavailable in
                new tickets. Tickets that already have it will keep the values
                associated to them.
            </p>
            <p>
                This field may be in use in rules and macros. Make sure to edit
                the rules and macros, as they will not be able to apply a value
                on an archived field.
            </p>
            <p>Are you sure you want to archive this field?</p>
        </ConfirmationModal>
    )
}
