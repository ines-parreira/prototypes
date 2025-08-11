import { useEffect, useState } from 'react'

import classNames from 'classnames'

import { Button, ToggleField, Tooltip } from '@gorgias/axiom'
import { useUpdateVoiceQueue } from '@gorgias/helpdesk-queries'
import { VoiceQueue, VoiceQueueStatus } from '@gorgias/helpdesk-types'

import { useNotify } from 'hooks/useNotify'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './VoiceQueueStatusToggle.less'

type Props = {
    queueId: number
    isEnabled: boolean
}

export default function VoiceQueueStatusToggle({ queueId, isEnabled }: Props) {
    const notify = useNotify()
    const [localEnabled, setLocalEnabled] = useState(isEnabled)
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
        useState(false)

    const { mutate: updateQueue, isLoading } = useUpdateVoiceQueue({
        mutation: {
            onSuccess: (response: { data: VoiceQueue }) => {
                const newStatus = response.data.status
                setLocalEnabled(newStatus === VoiceQueueStatus.Enabled)
                setIsConfirmationModalOpen(false)
                notify.success(`Queue was successfully ${newStatus}`)
            },
            onError: () => {
                notify.error('Failed to update queue status')
            },
        },
    })

    useEffect(() => {
        if (isEnabled !== localEnabled) {
            setLocalEnabled(isEnabled)
        }
        // eslint-disable-next-line exhaustive-deps
    }, [isEnabled])

    const handleToggle = () => {
        if (localEnabled) {
            setIsConfirmationModalOpen(true)
        } else {
            updateQueue({
                pk: queueId,
                data: { status: VoiceQueueStatus.Enabled },
            })
        }
    }

    return (
        <>
            <ToggleField
                value={localEnabled}
                onChange={handleToggle}
                isDisabled={isLoading}
                isLoading={isLoading}
                label={
                    <div className={css.label}>
                        <div>Enable queue</div>
                        <Tooltip
                            target="queue-status-tooltip"
                            placement="bottom"
                        >
                            {`Manage call routing during holidays or special events by enabling or disabling this queue. When disabled, the queue won't accept calls, and incoming calls will be redirected to voicemail.`}
                        </Tooltip>
                        <i
                            id="queue-status-tooltip"
                            className={classNames(
                                'material-icons',
                                css.infoIcon,
                            )}
                        >
                            info_outline
                        </i>
                    </div>
                }
            />

            <Modal
                isOpen={isConfirmationModalOpen}
                isClosable={false}
                onClose={() => {
                    setIsConfirmationModalOpen(false)
                }}
            >
                <ModalHeader title="Disable call queue?" />
                <ModalBody>
                    Disabling this queue will prevent it from receiving calls.
                    If it&apos;s currently part of a Voice integration, all
                    incoming calls will be sent to voicemail until you assign a
                    new queue or re-enable this one.
                </ModalBody>
                <ModalActionsFooter>
                    <Button
                        onClick={() => {
                            setIsConfirmationModalOpen(false)
                        }}
                        intent="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        intent="destructive"
                        onClick={() => {
                            updateQueue({
                                pk: queueId,
                                data: { status: VoiceQueueStatus.Disabled },
                            })
                        }}
                    >
                        Disable
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </>
    )
}
