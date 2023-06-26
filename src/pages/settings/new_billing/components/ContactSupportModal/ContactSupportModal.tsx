import React, {useEffect, useState} from 'react'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import Button from 'pages/common/components/button/Button'
import TextArea from 'pages/common/forms/TextArea'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {sendSupportTicket} from '../../utils/sendSupportTicket'
import css from './ContactSupportModal.less'

export type ContactSupportModalProps = {
    isOpen: boolean
    handleOnClose: () => void
    prepareMessage?: (message: string) => string
    defaultMessage?: string
    subject: string
    domain: string
    zapierHook: string
    to: string
    from: string
}

const ContactSupportModal = ({
    isOpen,
    handleOnClose,
    prepareMessage = (message) => message,
    defaultMessage = '',
    subject,
    zapierHook,
    to,
    from,
}: ContactSupportModalProps) => {
    const dispatch = useAppDispatch()
    const [message, setMessage] = useState(defaultMessage)

    useEffect(() => {
        setMessage(defaultMessage)
    }, [defaultMessage])

    const handleSendTicket = async () => {
        const messageToSend = prepareMessage(message)
        try {
            await sendSupportTicket({
                zapierHook,
                subject,
                message: messageToSend,
                from,
                to,
            })

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: `Your request has been submitted. We'll get back to you by email at ${from}`,
                    dismissAfter: 5000,
                    showDismissButton: true,
                })
            )
        } catch (e) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'There was an error sending your message. Please try again later.',
                })
            )
        } finally {
            handleOnClose()
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleOnClose}>
            <ModalHeader
                title="Contact us"
                subtitle="Tell us more about your request"
            />
            <ModalBody>
                <div className={css.container}>
                    <TextArea
                        onChange={(message) => {
                            setMessage(message)
                        }}
                        value={message}
                        autoRowHeight={true}
                        placeholder="Write your message here"
                    />
                </div>
            </ModalBody>
            <ModalActionsFooter
                extra={<div>Our team will send you a reply to {from}</div>}
            >
                <Button intent="secondary" onClick={handleOnClose}>
                    Cancel
                </Button>
                <Button onClick={handleSendTicket}>Send</Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default ContactSupportModal
