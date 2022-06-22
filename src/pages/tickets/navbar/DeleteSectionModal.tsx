import React from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'

import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import {Section} from '../../../models/section/types'

import css from './DeleteSectionModal.less'

type Props = {
    isOpen: boolean
    isSubmitting: boolean
    onClose: () => void
    onSubmit: () => void
    section: Maybe<Section>
}

export default function DeleteSectionModal({
    isOpen,
    isSubmitting,
    onClose,
    onSubmit,
    section,
}: Props) {
    const emoji = section?.decoration?.emoji

    return (
        <Modal isOpen={isOpen && !!section} onClose={onClose}>
            <ModalHeader title="Delete section" />
            {!!section && (
                <>
                    <ModalBody>
                        <div className={css.content}>
                            All the views in{' '}
                            <span className={css.sectionName}>
                                {emoji ? `${emoji} ` : null} {section.name}
                            </span>{' '}
                            will move back under{' '}
                            {section.private ? 'Private Views' : 'Shared Views'}
                            . This won't delete any view.
                        </div>
                    </ModalBody>
                    <ModalActionsFooter>
                        <Button
                            intent="destructive"
                            isLoading={isSubmitting}
                            onClick={onSubmit}
                        >
                            <ButtonIconLabel icon="delete">
                                Delete
                            </ButtonIconLabel>
                        </Button>

                        <Button intent="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalActionsFooter>
                </>
            )}
        </Modal>
    )
}
