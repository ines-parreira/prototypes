import { useState } from 'react'

import { history } from '@repo/routing'

import { LegacyButton as Button } from '@gorgias/axiom'
import { useDeleteVoiceQueue, VoiceQueue } from '@gorgias/helpdesk-queries'

import { useNotify } from 'hooks/useNotify'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import { PHONE_INTEGRATION_BASE_URL } from './constants'

type VoiceQueueDeleteProps = {
    queue: VoiceQueue
}

export default function VoiceQueueDelete({ queue }: VoiceQueueDeleteProps) {
    const notify = useNotify()
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
        useState<boolean>(false)
    const [hasLinkedIntegrationsError, setHasLinkedIntegrationsError] =
        useState<boolean>(false)

    const { mutate: deleteQueue } = useDeleteVoiceQueue({
        mutation: {
            onSuccess: () => {
                notify.success(`${queue.name} queue was successfully deleted`)
                history.push(`${PHONE_INTEGRATION_BASE_URL}/queues`)
            },
            onError: (error) => {
                if (error.status === 400) {
                    setHasLinkedIntegrationsError(true)
                } else {
                    notify.error(
                        "We couldn't delete the queue. Please try again.",
                    )
                }
            },
            onSettled: () => {
                setIsConfirmationModalOpen(false)
            },
        },
    })

    return (
        <>
            <Button
                intent="destructive"
                fillStyle="ghost"
                onClick={() => {
                    setIsConfirmationModalOpen(true)
                }}
            >
                Delete queue
            </Button>

            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => {
                    setIsConfirmationModalOpen(false)
                }}
                onConfirm={() => {
                    deleteQueue({ pk: queue.id })
                }}
            />

            <LinkedIntegrationsErrorModal
                isOpen={hasLinkedIntegrationsError}
                onClose={() => {
                    setHasLinkedIntegrationsError(false)
                }}
            />
        </>
    )
}

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
}: {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}) => {
    return (
        <Modal isOpen={isOpen} isClosable={false} onClose={onClose}>
            <ModalHeader title="Delete call queue?" />
            <ModalBody>
                Are you sure you want to delete this call queue? This action
                cannot be undone, and all associated settings will be lost.
            </ModalBody>
            <ModalActionsFooter>
                <Button onClick={onClose} intent="secondary">
                    Cancel
                </Button>
                <Button intent="destructive" onClick={onConfirm}>
                    Delete
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}

const LinkedIntegrationsErrorModal = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose: () => void
}) => {
    return (
        <Modal isOpen={isOpen} isClosable={false} onClose={onClose}>
            <ModalHeader title="Queue cannot be deleted" />
            <ModalBody>
                This queue is currently assigned to a phone integration(s),
                which cannot function without an assigned queue. To delete this
                queue, please assign a different queue to the phone
                integration(s) first.
            </ModalBody>
            <ModalActionsFooter>
                <Button onClick={onClose} intent="secondary">
                    Cancel
                </Button>
                <Button
                    as="a"
                    href={PHONE_INTEGRATION_BASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Manage integrations
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
