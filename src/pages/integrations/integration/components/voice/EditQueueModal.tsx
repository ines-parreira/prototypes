import {
    UpdateVoiceQueue,
    useUpdateVoiceQueue,
    VoiceQueue,
} from '@gorgias/api-queries'
import { Banner, Button } from '@gorgias/merchant-ui-kit'

import { useNotify } from 'hooks/useNotify'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import CreateEditQueueModalFormContent from './CreateEditQueueModalFormContent'
import { getVoiceQueueEditableFields } from './utils'
import VoiceFormSubmitButton from './VoiceFormSubmitButton'
import VoiceQueueSettingsForm from './VoiceQueueSettingsForm'

import css from './EditQueueModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    onUpdateSuccess?: () => void
    queue: VoiceQueue
}

export default function EditQueueModal({
    isOpen = true,
    onClose,
    onUpdateSuccess,
    queue,
}: Props) {
    const notify = useNotify()

    const { mutate: updateQueue } = useUpdateVoiceQueue({
        mutation: {
            onSuccess: (response) => {
                notify.success(
                    `'${response.data.name}' queue was successfully updated.`,
                )
                if (onUpdateSuccess) {
                    onUpdateSuccess()
                }
                onClose()
            },
            onError: () => {
                notify.error(
                    "We couldn't save your preferences. Please try again.",
                )
            },
        },
    })

    const handleSubmit = async (values: UpdateVoiceQueue) => {
        updateQueue({ pk: queue.id, data: values })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader title={`Edit ${queue.name}`} />
            <VoiceQueueSettingsForm<UpdateVoiceQueue>
                onSubmit={handleSubmit}
                initialValues={getVoiceQueueEditableFields(queue)}
            >
                <ModalBody className={css.modalBody}>
                    {!!queue.integrations?.length && (
                        <Banner type="warning">
                            This queue is linked to one or more phone
                            integrations. Any changes made here{' '}
                            <strong>will also affect those integrations</strong>
                            . Please ensure your updates do not disrupt other
                            workflows
                        </Banner>
                    )}
                    <CreateEditQueueModalFormContent />
                </ModalBody>
                <ModalActionsFooter>
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <VoiceFormSubmitButton>Save changes</VoiceFormSubmitButton>
                </ModalActionsFooter>
            </VoiceQueueSettingsForm>
        </Modal>
    )
}
