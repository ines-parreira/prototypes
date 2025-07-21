import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Location } from 'history'
import _noop from 'lodash/noop'
import { Prompt } from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import history from 'pages/history'

import css from './ConfirmNavigationPrompt.less'

type Props = {
    title: string
    bodyText: string
    cancelLabel: string
    confirmLabel: string
    enabled: boolean
}

export const ConfirmNavigationPrompt = ({
    title,
    bodyText,
    cancelLabel,
    confirmLabel,
    enabled,
}: Props) => {
    const isDiscarding = useRef(false)
    const [show, setShow] = useState(false)
    const [location, setLocation] = useState<Location>()

    const beforeUnload = useCallback(
        (e: BeforeUnloadEvent) => {
            if (enabled) {
                e.preventDefault()
                e.returnValue = ''
            }
            return
        },
        [enabled],
    )

    useEffect(() => {
        window.addEventListener('beforeunload', beforeUnload)

        return () => {
            window.removeEventListener('beforeunload', beforeUnload)
        }
    }, [beforeUnload])

    const redirectToOriginalLocation = () => {
        if (location) {
            isDiscarding.current = true
            history.push(location.pathname, location.state)
        }
    }

    useEffect(() => {
        const unlisten = history.listen(() => {
            // Reset isDiscarding to false after each navigation
            isDiscarding.current = false
        })

        return () => unlisten()
    }, [])

    return (
        <>
            <Prompt
                when={enabled}
                message={(location) => {
                    if (!isDiscarding.current) {
                        setLocation(location)
                        setShow(true)
                        return false
                    }

                    return true
                }}
            />

            <Modal isOpen={show} isClosable={false} onClose={_noop}>
                <ModalHeader title={title} />
                <ModalBody>{bodyText}</ModalBody>
                <ModalFooter className={css.footer}>
                    <Button intent="secondary" onClick={() => setShow(false)}>
                        {cancelLabel}
                    </Button>
                    <Button
                        intent="primary"
                        onClick={() => {
                            setShow(false)
                            redirectToOriginalLocation()
                        }}
                    >
                        {confirmLabel}
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    )
}
