import React, {MouseEvent, useEffect, useRef, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {requestNewIntegration} from 'models/integration/resources'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import TextArea from 'pages/common/forms/TextArea'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import css from './RequestApp.less'

export default function RequestApp() {
    const dispatch = useAppDispatch()
    const [isOpen, setOpen] = useState(false)
    const [description, setDescription] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        const ref = textareaRef.current

        if (isOpen) {
            ref?.focus()
        }
    }, [isOpen])

    const handleRequest = async (e: MouseEvent) => {
        e.preventDefault()
        try {
            await requestNewIntegration({description})
        } catch {
            void dispatch(
                notify({
                    message:
                        'Uh oh! An error happened trying to save your request, please try again.',
                    status: NotificationStatus.Error,
                })
            )
            return
        }
        void dispatch(
            notify({
                message: 'Thank you for your feedback!',
                status: NotificationStatus.Success,
            })
        )

        setDescription('')
        setOpen(false)
    }

    const toggleIsOpen = () => setOpen(!isOpen)

    return (
        <footer className={css.footer}>
            <h4 className={css.title}>{`Can’t find what you need?`}</h4>
            <p className={css.incentive}>
                {`If we're missing an app, let us know!`}
            </p>
            <Button onClick={toggleIsOpen}>Request App</Button>
            <Modal isOpen={isOpen} onClose={toggleIsOpen} size="small">
                <ModalHeader title="Request App" />
                <ModalBody className={css.modalBody}>
                    <TextArea
                        label="Details"
                        value={description}
                        autoRowHeight
                        ref={textareaRef}
                        onChange={(description) => setDescription(description)}
                        caption="Provide any relevant details such as app name, or app category"
                    />
                </ModalBody>
                <ModalFooter className={css.wrapper}>
                    <div className={css.actions}>
                        <Button
                            tabIndex={0}
                            intent="secondary"
                            onClick={toggleIsOpen}
                        >
                            Cancel
                        </Button>
                        <Button
                            intent="primary"
                            tabIndex={0}
                            onClick={handleRequest}
                            isDisabled={!description}
                        >
                            Submit Request
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </footer>
    )
}
