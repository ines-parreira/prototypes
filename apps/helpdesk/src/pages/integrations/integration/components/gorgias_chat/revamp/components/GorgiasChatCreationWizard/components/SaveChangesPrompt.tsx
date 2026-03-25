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

import css from './SaveChangesPrompt.less'

type Props = {
    when: boolean
    onSave: () => Promise<unknown> | void
    onDiscard?: () => void
    shouldRedirectAfterSave?: boolean
}

const SaveChangesPrompt: React.FC<Props> = ({
    when,
    onSave,
    onDiscard,
    shouldRedirectAfterSave = false,
}) => {
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

    const handleSave = async () => {
        if (shouldRedirectAfterSave) {
            await onSave()
            redirectToOriginalLocation()
        } else {
            await onSave()
            hideModal()
        }
    }

    const handleDiscard = () => {
        onDiscard?.()
        redirectToOriginalLocation()
    }

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
                <OverlayHeader title="Save changes?" />
                <OverlayContent>
                    <Text>
                        If you leave without saving, your changes will be lost.
                    </Text>
                </OverlayContent>
                <div className={css.footer}>
                    <Button
                        variant="tertiary"
                        intent="destructive"
                        onClick={handleDiscard}
                    >
                        Discard changes
                    </Button>
                    <div className={css.rightButtons}>
                        <Button variant="secondary" onClick={hideModal}>
                            Keep editing
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            Save changes
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default SaveChangesPrompt
