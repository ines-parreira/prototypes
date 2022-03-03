import React from 'react'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {Section} from '../../../models/section/types'
import Modal from '../../common/components/Modal'

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
    if (!section) {
        return null
    }
    const emoji = section.decoration?.emoji

    return (
        <Modal
            className={css.modal}
            centered
            header="Delete section"
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className={css.content}>
                All the views in{' '}
                <span className={css.sectionName}>
                    {emoji ? `${emoji} ` : null} {section.name}
                </span>{' '}
                will move back under{' '}
                {section.private ? 'Private Views' : 'Shared Views'}. This won't
                delete any view.
            </div>
            <div className="float-left mt-3">
                <Button
                    className="mr-2"
                    intent={ButtonIntent.Destructive}
                    isLoading={isSubmitting}
                    onClick={onSubmit}
                >
                    <ButtonIconLabel icon="delete">Delete</ButtonIconLabel>
                </Button>

                <Button intent={ButtonIntent.Secondary} onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </Modal>
    )
}
