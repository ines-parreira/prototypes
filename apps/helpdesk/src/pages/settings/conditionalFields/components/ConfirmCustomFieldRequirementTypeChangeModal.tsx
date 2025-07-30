import React, { useCallback } from 'react'

import { Link } from 'react-router-dom'

import { RequirementType } from '@gorgias/helpdesk-queries'

import { useUpdateCustomFieldDefinition } from 'custom-fields/hooks/queries/useUpdateCustomFieldDefinition'
import { CustomField, CustomFieldObjectTypes } from 'custom-fields/types'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { CUSTOM_FIELD_ROUTES } from 'routes/constants'

import css from './ConfirmCustomFieldRequirementTypeChangeModal.less'

const ConfirmRequirementTypeChangeModal = ({
    isOpen,
    customField,
    onCancel,
    onConfirmationSuccess,
}: {
    isOpen: boolean
    onCancel: () => void
    onConfirmationSuccess: (customField: CustomField) => void
    customField: CustomField
}) => {
    const requirementTypeLabel =
        customField.requirement_type === RequirementType.Required ||
        customField.required
            ? 'required'
            : 'always visible'

    const { mutateAsync, isLoading } = useUpdateCustomFieldDefinition()

    const handleConfirm = useCallback(async () => {
        const { object_type, definition, label, managed_type } = customField
        try {
            mutateAsync([
                customField.id,
                {
                    object_type,
                    definition,
                    label,
                    managed_type,
                    required: false,
                    requirement_type: RequirementType.Conditional,
                },
            ])
            onConfirmationSuccess(customField)
        } catch {}
    }, [customField, mutateAsync, onConfirmationSuccess])

    return (
        <Modal
            isOpen={isOpen}
            size="medium"
            isClosable={false}
            onClose={onCancel}
        >
            <ModalHeader title="Update field visibility?" />
            <ModalBody className={css.body}>
                This field is currently set to <b>{requirementTypeLabel}</b>
                . Changing to conditional visibility will override any current
                behaviors. <br />
                <br />
                To modify <b>conditional visibility</b> options, visit{' '}
                {customField.object_type} Field Settings.
            </ModalBody>
            <ModalActionsFooter className={css.footer}>
                <Button
                    intent="destructive"
                    fillStyle="ghost"
                    isDisabled={isLoading}
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <div className={css.proceedButtons}>
                    <SeeObjectLink
                        isDisabled={isLoading}
                        objectType={customField.object_type}
                        fieldId={customField.id}
                    />
                    <Button
                        intent="primary"
                        isLoading={isLoading}
                        onClick={handleConfirm}
                    >
                        Confirm
                    </Button>
                </div>
            </ModalActionsFooter>
        </Modal>
    )
}

const SeeObjectLink = ({
    isDisabled,
    objectType,
    fieldId,
}: {
    isDisabled: boolean
    objectType: CustomFieldObjectTypes
    fieldId: number
}) => {
    const text = `See ${objectType} Field`
    if (isDisabled) {
        return (
            <Button intent="secondary" isDisabled>
                {text}
            </Button>
        )
    }
    return (
        <Link
            to={`/app/settings/${CUSTOM_FIELD_ROUTES[objectType]}/${fieldId}/edit`}
        >
            <Button intent="secondary">{text}</Button>
        </Link>
    )
}

export default ConfirmRequirementTypeChangeModal
