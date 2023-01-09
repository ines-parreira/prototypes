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
            Archiving <b>{ticketFieldLabel}</b> will make it unavailable in new
            tickets. Tickets that already have it will keep the values
            associated to them. You won't be able to filter your reports and
            views by this field anymore.
            <br />
            <br />
            Are you sure you want to archive this field?
        </ConfirmationModal>
    )
}
