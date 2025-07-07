import { Button } from '@gorgias/merchant-ui-kit'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import SectionHeader from 'pages/common/components/SectionHeader/SectionHeader'

import AddCustomBusinessHoursModalGeneralSection from './AddCustomBusinessHoursModalGeneralSection'
import CustomBusinessHoursForm from './CustomBusinessHoursForm'
import CustomBusinessHoursIntegrationsTable from './CustomBusinessHoursIntegrationsTable'
import FormSectionCard from './FormSectionCard'

import css from './AddCustomBusinessHoursModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export default function AddCustomBusinessHoursModal({
    isOpen,
    onClose,
}: Props) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="huge"
            className={css.temporaryClassName}
            isClosable={false}
        >
            <CustomBusinessHoursForm onSubmit={onClose}>
                <ModalHeader title="Add Custom Business Hours" />
                <ModalBody className={css.modalBody}>
                    <FormSectionCard>
                        <SectionHeader
                            title="Let customers know when your team is available."
                            description="Create a custom schedule to define the days and hours your team is online. These hours can be used to control rules, chat and voice availability, and auto-responses. You can assign this schedule to specific integrations and override it with holiday hours when needed."
                        />
                    </FormSectionCard>
                    <FormSectionCard>
                        <AddCustomBusinessHoursModalGeneralSection />
                    </FormSectionCard>
                    <FormSectionCard>
                        <CustomBusinessHoursIntegrationsTable />
                    </FormSectionCard>
                </ModalBody>
                <ModalActionsFooter className={css.actionsFooter}>
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onClose}>Add Business Hours</Button>
                </ModalActionsFooter>
            </CustomBusinessHoursForm>
        </Modal>
    )
}
