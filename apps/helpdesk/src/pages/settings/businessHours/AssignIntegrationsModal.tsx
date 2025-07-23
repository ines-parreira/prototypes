import { useFormContext } from 'react-hook-form'

import { Button } from '@gorgias/merchant-ui-kit'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import CustomBusinessHoursIntegrationsTable from './CustomBusinessHoursIntegrationsTable'
import { EditCustomBusinessHoursFormValues } from './types'

import css from './AssignIntegrationsModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export default function AssignIntegrationsModal({ isOpen, onClose }: Props) {
    const { setValue, resetField } =
        useFormContext<EditCustomBusinessHoursFormValues>()
    const { watch } = useFormContext<EditCustomBusinessHoursFormValues>()

    const temporaryAssignedIntegrations = watch(
        'temporary_assigned_integrations',
    )

    const handleUpdateSelection = () => {
        setValue(
            'assigned_integrations.assign_integrations',
            temporaryAssignedIntegrations,
        )
        resetField('temporary_assigned_integrations')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="huge">
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
                <Button onClick={onClose} intent="secondary">
                    Cancel
                </Button>
                <Button onClick={handleUpdateSelection}>
                    Update selection
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
