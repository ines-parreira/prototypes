import { useCallback, useEffect, useRef, useState } from 'react'

import { history } from '@repo/routing'
import type { Location } from 'history'
import { Prompt } from 'react-router-dom'

import {
    Button,
    Modal,
    OverlayContent,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import css from './DiscardNewChatPrompt.less'

type Props = {
    when: boolean
}

const DiscardNewChatPrompt: React.FC<Props> = ({ when }) => {
    const isDiscarding = useRef(false)
    const [isOpen, setIsOpen] = useState(false)
    const [location, setLocation] = useState<Location>()

    const beforeUnload = useCallback(
        (e: BeforeUnloadEvent) => {
            if (when) {
                e.preventDefault()
                e.returnValue = ''
            }
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

    const hideModal = useCallback(() => setIsOpen(false), [])

    return (
        <>
            <Prompt
                when={when}
                message={(loc) => {
                    if (!isDiscarding.current) {
                        setLocation(loc)
                        setIsOpen(true)
                        return false
                    }
                    return true
                }}
            />
            <Modal isOpen={isOpen} onOpenChange={hideModal} size="sm">
                <OverlayHeader title="Leave without saving?" />
                <OverlayContent>
                    <Text>
                        If you leave now, everything you&apos;ve entered will be
                        lost.
                    </Text>
                </OverlayContent>
                <div className={css.footer}>
                    <Button variant="secondary" onClick={hideModal}>
                        Stay on page
                    </Button>
                    <Button
                        variant="tertiary"
                        intent="destructive"
                        onClick={redirectToOriginalLocation}
                    >
                        Leave anyway
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default DiscardNewChatPrompt
