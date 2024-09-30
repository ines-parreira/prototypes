import React from 'react'

import {OBJECT_TYPES, OBJECT_TYPE_SETTINGS} from 'models/customField/constants'
import {CustomFieldObjectTypes} from 'models/customField/types'
import {ConfirmationModal} from 'pages/settings/helpCenter/components/ConfirmationModal'

export type Props = {
    customFieldLabel: string
    isOpen: boolean
    onConfirm: () => void
    onClose: () => void
    objectType: CustomFieldObjectTypes
}

export default function ArchiveConfirmationModal({
    customFieldLabel,
    isOpen,
    onConfirm,
    onClose,
    objectType,
}: Props) {
    const customFieldTypeLabel = OBJECT_TYPE_SETTINGS[objectType].LABEL
    const customFieldTypeTitleLabel =
        OBJECT_TYPE_SETTINGS[objectType].TITLE_LABEL
    return (
        <ConfirmationModal
            isOpen={isOpen}
            title={`Archive ${customFieldTypeLabel} field`}
            confirmText="Archive"
            confirmIntent="primary"
            onConfirm={onConfirm}
            onClose={onClose}
        >
            <p>
                Archiving <b>{customFieldLabel}</b> will make it unavailable in
                new {customFieldTypeLabel}s. {customFieldTypeTitleLabel}s that
                already have it will keep the values associated to them.
            </p>
            {objectType === OBJECT_TYPES.TICKET && (
                <p>
                    This field may be in use in rules and macros. Make sure to
                    edit the rules and macros, as they will not be able to apply
                    a value on an archived field.
                </p>
            )}
            <p>Are you sure you want to archive this field?</p>
        </ConfirmationModal>
    )
}
