import {
    LegacyBanner as Banner,
    LegacyButton as Button,
    toast,
} from '@gorgias/axiom'
import type { UpdateVoiceQueue, VoiceQueue } from '@gorgias/helpdesk-queries'
import { useUpdateVoiceQueue } from '@gorgias/helpdesk-queries'

import { DefaultExportModal as Modal } from 'pages/common/components/modal/Modal'
import { ModalActionsFooter } from 'pages/common/components/modal/ModalActionsFooter'
import { DefaultExportModalBody as ModalBody } from 'pages/common/components/modal/ModalBody'
import { ModalHeader } from 'pages/common/components/modal/ModalHeader'

import { CreateEditQueueModalFormContent } from './CreateEditQueueModalFormContent'
import { getVoiceQueueEditableFields } from './utils'
import { VoiceFormSubmitButton } from './VoiceFormSubmitButton'
import { VoiceQueueSettingsForm } from './VoiceQueueSettingsForm'

import css from './EditQueueModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    onUpdateSuccess?: () => void
    queue: VoiceQueue
}

export function EditQueueModal({
    isOpen = true,
    onClose,
    onUpdateSuccess,
    queue,
}: Props) {
    const { mutate: updateQueue } = useUpdateVoiceQueue({
        mutation: {
            onSuccess: (response) => {
                toast.success(
                    `'${response.data.name}' queue was successfully updated.`,
                )
                if (onUpdateSuccess) {
                    onUpdateSuccess()
                }
                onClose()
            },
            onError: () => {
                toast.error(
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
