import React from 'react'

import _noop from 'lodash/noop'

import { Banner, Button } from '@gorgias/merchant-ui-kit'

import { AlertType } from 'pages/common/components/Alert/Alert'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './SyncDomainConfirmationModal.less'

type Props = {
    isOpen: boolean
    onCancel: () => void
    onSync: () => void
}

const SyncDomainConfirmationModal = ({ isOpen, onCancel, onSync }: Props) => {
    return (
        <Modal isOpen={isOpen} isClosable={false} onClose={_noop}>
            <ModalHeader title="Sync store website" />
            <ModalBody className={css.body}>
                <div>
                    Syncing will replace all existing questions and answers,
                    reset any disabled questions and answers, and update all
                    product information from your store website.
                </div>
                <Banner variant="inline" icon type={AlertType.Warning}>
                    This action cannot be undone. You will need to review newly
                    generated questions and answers after syncing.
                </Banner>
            </ModalBody>
            <ModalFooter className={css.footer}>
                <Button intent="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button leadingIcon="sync" onClick={onSync}>
                    Sync
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default SyncDomainConfirmationModal
