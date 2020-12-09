import classnames from 'classnames'
import React from 'react'
import {Button} from 'reactstrap'

import {Section} from '../../../models/section/types'
import Modal from '../../common/components/Modal.js'

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
                    className={classnames('mr-2', {
                        'btn-loading': isSubmitting,
                    })}
                    color="danger"
                    disabled={isSubmitting}
                    onClick={onSubmit}
                    type="button"
                >
                    <i className="material-icons">delete</i> Delete
                </Button>

                <Button color="secondary" type="button" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </Modal>
    )
}
