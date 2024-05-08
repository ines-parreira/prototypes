import React from 'react'
import {queryKeys, useArchiveSlaPolicy} from '@gorgias/api-queries'
import {useQueryClient} from '@tanstack/react-query'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import settingsCss from 'pages/settings/settings.less'
import history from 'pages/history'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

type Props = {
    policyId: string
    isOpen: boolean
    onClose: () => void
}

export const DeleteModal = ({policyId, isOpen, onClose}: Props) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const {mutateAsync: deletePolicy, isLoading: isDeleting} =
        useArchiveSlaPolicy()

    const handleClick = async () => {
        try {
            await deletePolicy({id: policyId})
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'SLA policy deleted.',
                })
            )
            await queryClient.invalidateQueries({
                queryKey: queryKeys.slaPolicies.listSlaPolicies(),
            })
            history.push('/app/settings/sla')
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `Failed to delete SLA policy`,
                })
            )
            onClose()
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} isClosable={true} size="small">
            <ModalHeader title={`Delete SLA?`} />
            <ModalBody>
                <div className={settingsCss.mb32}>
                    Deleting this SLA will stop it from triggering on new
                    tickets. Existing reports will still be available.
                </div>
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    type="button"
                    intent="destructive"
                    isLoading={isDeleting}
                    onClick={handleClick}
                >
                    Delete SLA
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
