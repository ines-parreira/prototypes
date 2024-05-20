import React, {useEffect, useState} from 'react'
import Modal from '../modal/Modal'
import ModalBody from '../modal/ModalBody'
import ModalHeader from '../modal/ModalHeader'
import {logoutUser} from './logoutUser'

const AUTO_LOGOUT_SECONDS = 5

export const LOGOUT_EXPLANATION = `You will be redirected to the login screen in ${AUTO_LOGOUT_SECONDS}s`
export const USER_CHANGE_EXPLANATION = `The page will refresh in ${AUTO_LOGOUT_SECONDS}s`

export default function SessionChangeDetection() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLogout, setIsLogout] = useState(false)

    // Enable Universal Logout detection
    // This listens messages sent by the `check_session_iframe` to detect when a user has been logged out from another tab/application
    // based on OIDC specs: https://openid.net/specs/openid-connect-session-1_0.html
    // Gorgias specs: https://www.notion.so/gorgias/Tech-Spec-Add-session-management-to-the-IdP-3ec7a9e6720d43828f42b3636377e800?pvs=4
    useEffect(() => {
        let timeout: number
        const listener = (message: MessageEvent) => {
            if (message.data === 'check_session_iframe.user_logged_out') {
                // Can happen if the user logged out from another tab
                setIsLogout(true)
                setIsOpen(true)
                timeout = logoutUser(AUTO_LOGOUT_SECONDS)
            } else if (message.data === 'check_session_iframe.user_changed') {
                // Can happen when logging into another user while already logged in (for example during impersonation)
                setIsLogout(false)
                setIsOpen(true)
                timeout = window.setTimeout(() => {
                    window.location.reload()
                }, AUTO_LOGOUT_SECONDS * 1000)
            }
        }

        window.addEventListener('message', listener)

        return () => {
            timeout && clearTimeout(timeout)
            window.removeEventListener('message', listener)
        }
    }, [])

    return (
        <div>
            <Modal isOpen={isOpen} isClosable={false} onClose={() => undefined}>
                <ModalHeader
                    title={
                        isLogout
                            ? 'You have been logged out!'
                            : 'You changed user!'
                    }
                />
                <ModalBody>
                    <p>
                        {isLogout
                            ? LOGOUT_EXPLANATION
                            : USER_CHANGE_EXPLANATION}
                    </p>
                </ModalBody>
            </Modal>
        </div>
    )
}
