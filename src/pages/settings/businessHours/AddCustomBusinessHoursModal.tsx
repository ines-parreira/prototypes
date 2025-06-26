import { Button } from '@gorgias/merchant-ui-kit'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import SectionHeader from 'pages/common/components/SectionHeader/SectionHeader'

import FormSectionCard from './FormSectionCard'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export default function AddCustomBusinessHoursModal({
    isOpen,
    onClose,
}: Props) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="huge">
            <ModalHeader title="Add Custom Business Hours" />
            <ModalBody>
                <FormSectionCard>
                    <SectionHeader
                        title="Let customers know when your team is available."
                        description="Create a custom schedule to define the days and hours your team is online. These hours can be used to control rules, chat and voice availability, and auto-responses. You can assign this schedule to specific integrations and override it with holiday hours when needed."
                    />
                </FormSectionCard>
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={onClose}>Add Business Hours</Button>
            </ModalActionsFooter>
        </Modal>
    )
}
