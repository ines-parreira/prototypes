import React, {useRef} from 'react'
import {Form} from 'reactstrap'

import {SectionDraft} from 'models/section/types'
import Button from 'pages/common/components/button/Button'
import EmojiSelect from 'pages/common/components/ViewTable/EmojiSelect/EmojiSelect'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
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
    const inputElement = useRef<HTMLInputElement>(null)
    const modalElement = useRef<HTMLDivElement>(null)

    return (
        <Modal
            size="small"
            isOpen={isOpen && !!sectionForm}
            onClose={onClose}
            animation="none"
            ref={modalElement}
        >
            <ModalHeader
                title={`${isNewSection ? 'Create' : 'Update'} section`}
            />
            {!!sectionForm && (
                <Form
                    onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit()
                    }}
                >
                    <ModalBody>
                        <InputGroup className={css.inputGroup}>
                            <TextInput
                                ref={inputElement}
                                id="name"
                                className={css.inputWrapper}
                                inputClassName={css.input}
                                value={sectionForm.name}
                                placeholder="Choose a helpful name"
                                onChange={(name: string) =>
                                    onChange('name', name)
                                }
                                prefix={
                                    <EmojiSelect
                                        container={modalElement}
                                        className={css.emojiSelect}
                                        emoji={
                                            sectionForm.decoration?.emoji ||
                                            null
                                        }
                                        onEmojiSelect={(
                                            emoji: string,
                                            event
                                        ) => {
                                            event.stopPropagation()
                                            onChange('decoration', {emoji})
                                            inputElement.current?.focus()
                                        }}
                                        onEmojiClear={(event) => {
                                            event.stopPropagation()
                                            onChange('decoration', null)
                                            inputElement.current?.focus()
                                        }}
                                    />
                                }
                                autoFocus
                                isRequired
                            />
                        </InputGroup>
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
                                    <span className={css.tipEmoji}>©</span>
                                    Brand{' '}
                                    <span className={css.tip}>
                                        – All integrations related to a given
                                        brand
                                    </span>
                                </div>
                            </>
                        )}
                    </ModalBody>
                    <ModalActionsFooter>
                        <Button
                            type="submit"
                            className="mr-2"
                            isDisabled={sectionForm.name.length === 0}
                            isLoading={isSubmitting}
                        >
                            {isNewSection ? 'Create' : 'Update'}
                        </Button>
                        <Button intent="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalActionsFooter>
                </Form>
            )}
        </Modal>
    )
}
