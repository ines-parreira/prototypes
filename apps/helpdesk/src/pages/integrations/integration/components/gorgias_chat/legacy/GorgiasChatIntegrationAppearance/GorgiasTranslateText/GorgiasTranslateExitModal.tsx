import React, { useCallback, useRef } from 'react'

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

import { useAppNode } from 'appNode'

import css from './GorgiasTranslateText.less'

export type Props = {
    onConfirm: () => void
    onDiscard: () => void
    onClose: () => void
    isOpen: boolean
    fade?: boolean
}

const GorgiasTranslateExitModal = ({
    isOpen,
    onClose,
    onConfirm,
    onDiscard,
    fade = true,
}: Props) => {
    const buttonWrapper = useRef<HTMLDivElement>(null)
    const appNode = useAppNode()

    const onCloseCallback = useCallback(() => {
        onClose()
    }, [onClose])

    const onDiscardCallback = useCallback(() => {
        onDiscard()
    }, [onDiscard])

    const onConfirmCallback = useCallback(() => {
        onConfirm()
    }, [onConfirm])

    return (
        <Modal
            isOpen={isOpen}
            toggle={onCloseCallback}
            className={css.modal}
            fade={fade}
            centered
            container={appNode ?? undefined}
        >
            <ModalHeader toggle={onCloseCallback}>Save changes?</ModalHeader>
            <ModalBody className={css.modalBody}>
                <p>
                    Changing pages will discard all changes made. Do you want to
                    save them?
                </p>
            </ModalBody>

            <ModalFooter className={css.footer}>
                <Button color="danger" onClick={onDiscardCallback}>
                    Discard Changes
                </Button>
                <Button
                    intent="secondary"
                    onClick={onCloseCallback}
                    className={css.separateButtonsGroup}
                >
                    Cancel
                </Button>
                <div ref={buttonWrapper}>
                    <Button
                        type="submit"
                        color="primary"
                        className="mr-3"
                        onClick={onConfirmCallback}
                    >
                        Save Changes
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default GorgiasTranslateExitModal
