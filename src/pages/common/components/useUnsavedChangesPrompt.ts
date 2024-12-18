import {Location} from 'history'
import {useCallback, useEffect, useRef, useState} from 'react'
import {PromptProps} from 'react-router-dom'

import history from 'pages/history'

type Props = {
    when: boolean | undefined
}

const useUnsavedChangesPrompt = ({when}: Props) => {
    const isDiscarding = useRef(false)
    const [show, setShow] = useState(false)
    const [location, setLocation] = useState<Location>()

    const beforeUnload = useCallback(
        (event: BeforeUnloadEvent) => {
            if (when) {
                event.preventDefault()
                event.returnValue = ''
            }
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

    const onNavigateAway = useCallback<Exclude<PromptProps['message'], string>>(
        (location) => {
            if (!isDiscarding.current) {
                setLocation(location)
                setShow(true)
                return false
            }

            return true
        },
        []
    )

    const onClose = useCallback(() => {
        setShow(false)
    }, [])

    return {
        isOpen: show,
        onClose,
        redirectToOriginalLocation,
        onNavigateAway,
    }
}

export default useUnsavedChangesPrompt
