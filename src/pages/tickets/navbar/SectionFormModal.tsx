import classnames from 'classnames'
import React from 'react'
import {Form} from 'reactstrap'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import InputField from 'pages/common/forms/InputField'
import {SectionDraft} from '../../../models/section/types'
import Modal from '../../common/components/Modal'
import EmojiSelect from '../../common/components/ViewTable/EmojiSelect/EmojiSelect'

import css from './SectionFormModal.less'

type Props = {
    isNewSection: boolean
    isOpen: boolean
    isSubmitting: boolean
    onChange: <T extends keyof SectionDraft>(
        name: T,
        value: SectionDraft[T]
    ) => void
    onClose: () => void
    onSubmit: () => void
    sectionForm: Maybe<SectionDraft>
}

export default function SectionFormModal({
    isNewSection,
    isOpen,
    isSubmitting,
    onChange,
    onClose,
    onSubmit,
    sectionForm,
}: Props) {
    if (!sectionForm) {
        return null
    }
    return (
        <Modal
            autoFocus={false}
            className={css.modal}
            centered
            header={`${isNewSection ? 'Create' : 'Update'} section`}
            isOpen={isOpen}
            onClose={onClose}
        >
            <Form
                onSubmit={(e) => {
                    e.preventDefault()
                    onSubmit()
                }}
            >
                <div className="d-flex">
                    <EmojiSelect
                        className={css.emojiSelect}
                        emoji={sectionForm.decoration?.emoji || null}
                        onEmojiSelect={(emoji: string) =>
                            onChange('decoration', {emoji})
                        }
                        onEmojiClear={() => onChange('decoration', null)}
                    />
                    <InputField
                        autoFocus
                        className={classnames('flex-grow', css.nameInput)}
                        type="text"
                        name="name"
                        required
                        value={sectionForm.name}
                        onChange={(name: string) => onChange('name', name)}
                        placeholder="Choose a helpful name"
                    />
                </div>
                {isNewSection && (
                    <>
                        <div className={css.tipWrapper}>
                            <span
                                className={css.tipEmoji}
                                role="img"
                                aria-label="chat bubble"
                            >
                                💬
                            </span>
                            Channels{' '}
                            <span className={css.tip}>
                                – All of your support channels
                            </span>
                        </div>
                        <div className={css.tipWrapper}>
                            <span
                                className={css.tipEmoji}
                                role="img"
                                aria-label="cardboard box"
                            >
                                📦
                            </span>
                            Type{' '}
                            <span className={css.tip}>
                                – Break down tickets by type
                            </span>
                        </div>
                        <div className={css.tipWrapper}>
                            <span className={css.tipEmoji}>©</span>Brand{' '}
                            <span className={css.tip}>
                                – All integrations related to a given brand
                            </span>
                        </div>
                    </>
                )}
                <div className="float-left mt-3">
                    <Button
                        type="submit"
                        className="mr-2"
                        isDisabled={sectionForm.name.length === 0}
                        isLoading={isSubmitting}
                    >
                        {isNewSection ? 'Create' : 'Update'}
                    </Button>
                    <Button intent={ButtonIntent.Secondary} onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </Form>
        </Modal>
    )
}
