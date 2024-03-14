import React, {useState, useRef, useCallback, useEffect} from 'react'
import {Location} from 'history'
import {Prompt} from 'react-router-dom'
import classNames from 'classnames'
import _noop from 'lodash/noop'

import history from 'pages/history'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'

import css from './UnsavedChangesPrompt.less'

type Props = {
    onDiscard?: () => void
    onSave: (location?: Location) => Promise<unknown> | void
    shouldRedirectAfterSave?: boolean
    when: boolean | undefined
}

const UnsavedChangesPrompt: React.FC<Props> = ({
    onDiscard,
    onSave,
    shouldRedirectAfterSave,
    when,
}) => {
    const isDiscarding = useRef(false)
    const [show, setShow] = useState(false)
    const [location, setLocation] = useState<Location>()

    const beforeUnload = useCallback(
        (e: BeforeUnloadEvent) => {
            if (when) {
                e.preventDefault()
                e.returnValue = ''
            }
            return
        },
        [when]
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
                when={when}
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
                <ModalHeader title="Save changes?" />
                <ModalBody className={css.body}>
                    Your changes to this page will be lost if you don’t save
                    them.
                </ModalBody>
                <ModalFooter className={classNames(css.footer, 'pt-3 px-3')}>
                    <div>
                        <Button
                            fillStyle="ghost"
                            intent="destructive"
                            onClick={() => {
                                setShow(false)
                                onDiscard && onDiscard()
                                redirectToOriginalLocation()
                            }}
                            className="mr-2 mb-3"
                        >
                            Discard Changes
                        </Button>
                    </div>
                    <div>
                        <Button
                            intent="secondary"
                            onClick={() => setShow(false)}
                            className="mr-2 mb-3"
                        >
                            Back To Editing
                        </Button>
                        <Button
                            onClick={async () => {
                                if (shouldRedirectAfterSave) {
                                    onSave(location)?.then(
                                        redirectToOriginalLocation
                                    )
                                } else {
                                    await onSave(location)
                                }

                                setShow(false)
                            }}
                            className="mb-3"
                        >
                            Save Changes
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default UnsavedChangesPrompt
