import { useFormContext } from 'react-hook-form'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import { useCustomBusinessHoursContext } from './CustomBusinessHoursContext'
import CustomBusinessHoursIntegrationsTable from './CustomBusinessHoursIntegrationsTable'
import type { EditCustomBusinessHoursFormValues } from './types'

import css from './AssignIntegrationsModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export default function AssignIntegrationsModal({ isOpen, onClose }: Props) {
    const { setValue, resetField, watch } =
        useFormContext<EditCustomBusinessHoursFormValues>()
    const { integrationsToOverride, resetIntegrationsToOverride } =
        useCustomBusinessHoursContext()

    const temporaryAssignedIntegrations = watch(
        'temporary_assigned_integrations',
    )
    const overrideConfirmation = watch('overrideConfirmation')

    const handleClose = () => {
        resetField('temporary_assigned_integrations')
        resetField('overrideConfirmation')
        resetIntegrationsToOverride()
        onClose()
    }

    const handleUpdateSelection = () => {
        setValue(
            'assigned_integrations.assign_integrations',
            temporaryAssignedIntegrations,
        )
        handleClose()
    }

    const isUpdateSelectionDisabled =
        !overrideConfirmation && integrationsToOverride.length > 0

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="huge">
            <ModalHeader title="Select integrations" />
            <ModalBody className={css.modalBody}>
                <p>
                    Select which integrations should use this business hours
                    schedule. Updates will take effect when you save your
                    business hours changes.
                </p>
                <CustomBusinessHoursIntegrationsTable name="temporary_assigned_integrations" />
            </ModalBody>
            <ModalActionsFooter>
                <Button onClick={handleClose} intent="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={handleUpdateSelection}
                    id="update-integrations-selection"
                    isDisabled={isUpdateSelectionDisabled}
                >
                    Update selection
                </Button>
                {isUpdateSelectionDisabled && (
                    <Tooltip target="update-integrations-selection">
                        You have to confirm overwriting the existing schedules
                        to be able to update the selection.
                    </Tooltip>
                )}
            </ModalActionsFooter>
        </Modal>
    )
}
