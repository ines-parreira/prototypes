import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {OBJECT_TYPES, OBJECT_TYPE_SETTINGS} from 'custom-fields/constants'
import {CustomFieldObjectTypes} from 'custom-fields/types'
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
    const isAnalyticsSavedFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsSavedFilters]
    const customFieldTypeLabel = OBJECT_TYPE_SETTINGS[objectType].LABEL
    const customFieldTypeTitleLabel =
        OBJECT_TYPE_SETTINGS[objectType].TITLE_LABEL
    const ticketFieldsRelatedMessage = useMemo(() => {
        if (isAnalyticsSavedFilters) {
            return 'This field may be in use in Rules, Macros and Saved Filters. Make sure to edit them, as they will not be able to apply a value on an archived field.'
        }
        return 'This field may be in use in rules and macros. Make sure to edit the rules and macros, as they will not be able to apply a value on an archived field.'
    }, [isAnalyticsSavedFilters])

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
                Archiving <b>{customFieldLabel}</b> will make it unavailable to
                new {customFieldTypeLabel}s. {customFieldTypeTitleLabel}s with
                existing fields will keep the values associated to them.
            </p>
            {objectType === OBJECT_TYPES.TICKET && (
                <p>{ticketFieldsRelatedMessage}</p>
            )}
            <p>Are you sure you want to archive this field?</p>
        </ConfirmationModal>
    )
}
