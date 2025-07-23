import {
    BusinessHoursCreate,
    useCreateBusinessHours,
} from '@gorgias/helpdesk-queries'
import { Button } from '@gorgias/merchant-ui-kit'

import { FormSubmitButton } from 'core/forms'
import { useNotify } from 'hooks/useNotify'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import SectionHeader from 'pages/common/components/SectionHeader/SectionHeader'

import AddCustomBusinessHoursModalGeneralSection from './AddCustomBusinessHoursModalGeneralSection'
import CreateCustomBusinessHoursForm from './CreateCustomBusinessHoursForm'
import CustomBusinessHoursIntegrationsTable from './CustomBusinessHoursIntegrationsTable'
import FormSectionCard from './FormSectionCard'

import css from './AddCustomBusinessHoursModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    onCreateSuccess?: (id: number) => void
}

export default function AddCustomBusinessHoursModal({
    isOpen,
    onClose,
    onCreateSuccess,
}: Props) {
    const notify = useNotify()

    const { mutate: createBusinessHours, isLoading } = useCreateBusinessHours({
        mutation: {
            onSuccess: (response) => {
                notify.success(
                    `'${response.data.name}' business hours were successfully created.`,
                )

                onClose()
                onCreateSuccess?.(response.data.id)
            },
            onError: () => {
                notify.error(
                    "We couldn't save your preferences. Please try again.",
                )
            },
        },
    })

    const handleSubmit = (values: BusinessHoursCreate) => {
        createBusinessHours({ data: values })
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="huge"
            className={css.temporaryClassName}
            isClosable={false}
        >
            <CreateCustomBusinessHoursForm onSubmit={handleSubmit}>
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
                        <SectionHeader
                            title="Integrations"
                            description="Assign one or multiple integrations for your custom business hours."
                        />
                        <CustomBusinessHoursIntegrationsTable />
                    </FormSectionCard>
                </ModalBody>
                <ModalActionsFooter className={css.actionsFooter}>
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <FormSubmitButton isLoading={isLoading}>
                        Add Business Hours
                    </FormSubmitButton>
                </ModalActionsFooter>
            </CreateCustomBusinessHoursForm>
        </Modal>
    )
}
