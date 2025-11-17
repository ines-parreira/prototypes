import type React from 'react'
import { createContext, useCallback, useEffect, useRef, useState } from 'react'

import { history } from '@repo/routing'
import type { Location } from 'history'
import _noop from 'lodash/noop'
import { Prompt } from 'react-router-dom'

import Modal from 'pages/common/components/modal/Modal'

type PromptModalContextType = {
    redirectToOriginalLocation: () => void
    hideModal: () => void
    location?: Location
}

export const PromptModalContext = createContext<PromptModalContextType>({
    redirectToOriginalLocation: _noop,
    hideModal: _noop,
})

type Props = {
    when: boolean | undefined
    children: React.ReactNode
}

const PromptModal: React.FC<Props> = ({ when, children }) => {
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
        [when],
    )

    useEffect(() => {
        window.addEventListener('beforeunload', beforeUnload)

        return () => {
            window.removeEventListener('beforeunload', beforeUnload)
        }
    }, [beforeUnload])

    const redirectToOriginalLocation = useCallback(() => {
        if (location) {
            isDiscarding.current = true

            history.push(location.pathname, location.state)
        }
    }, [location])

    const hideModal = useCallback(() => setShow(false), [])

    return (
        <PromptModalContext.Provider
            value={{ redirectToOriginalLocation, hideModal, location }}
        >
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
                {children}
            </Modal>
        </PromptModalContext.Provider>
    )
}

export default PromptModal
