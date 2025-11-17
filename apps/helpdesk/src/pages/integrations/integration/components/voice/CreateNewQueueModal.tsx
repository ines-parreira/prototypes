import { LegacyButton as Button } from '@gorgias/axiom'
import type { CreateVoiceQueue } from '@gorgias/helpdesk-queries'
import { useCreateVoiceQueues } from '@gorgias/helpdesk-queries'

import { useNotify } from 'hooks/useNotify'
import LearnMoreLink from 'pages/common/components/LearnMore/LearnMoreLink'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import { PHONE_INTEGRATION_BASE_URL } from './constants'
import CreateEditQueueModalFormContent from './CreateEditQueueModalFormContent'
import VoiceFormSubmitButton from './VoiceFormSubmitButton'
import VoiceQueueSettingsForm from './VoiceQueueSettingsForm'

import css from './CreateNewQueueModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    onCreateSuccess: (id: number) => void
}

export default function CreateNewQueueModal({
    isOpen = true,
    onClose,
    onCreateSuccess,
}: Props) {
    const notify = useNotify()
    const { mutate: createQueue } = useCreateVoiceQueues({
        mutation: {
            onSuccess: (response) => {
                notify.success(
                    `'${response.data.name}' queue was successfully created.`,
                )

                onCreateSuccess(response.data.id)
                onClose()
            },
            onError: () => {
                notify.error(
                    "We couldn't save your preferences. Please try again.",
                )
            },
        },
    })

    const handleSubmit = async (values: CreateVoiceQueue) => {
        createQueue({ data: values })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader title="Create new queue" />
            <VoiceQueueSettingsForm onSubmit={handleSubmit}>
                <ModalBody className={css.modalBody}>
                    <div className={css.learnMore}>
                        <div>
                            You can view or adjust these settings later in{' '}
                            <a
                                href={`${PHONE_INTEGRATION_BASE_URL}/queues`}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                Queues settings
                            </a>
                            .
                        </div>
                        <LearnMoreLink url="https://docs.gorgias.com/en-US/create-and-manage-call-queues-296974">
                            How to setup a call queue
                        </LearnMoreLink>
                    </div>
                    <CreateEditQueueModalFormContent />
                </ModalBody>
                <ModalActionsFooter>
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <VoiceFormSubmitButton>Create queue</VoiceFormSubmitButton>
                </ModalActionsFooter>
            </VoiceQueueSettingsForm>
        </Modal>
    )
}
