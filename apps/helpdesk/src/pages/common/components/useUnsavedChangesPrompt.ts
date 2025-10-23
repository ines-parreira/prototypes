import { useCallback, useEffect, useRef, useState } from 'react'

import { history } from '@repo/routing'
import { Location } from 'history'
import { PromptProps } from 'react-router-dom'

type Props = {
    when: boolean | undefined
}

const useUnsavedChangesPrompt = ({ when }: Props) => {
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

    useEffect(() => {
        const unlisten = history.listen(() => {
            // Reset isDiscarding to false after each navigation
            isDiscarding.current = false
        })

        return () => unlisten()
    }, [])

    /**
     * This function triggers the unsaved changes modal to be opened (based on when condition) when the user tries to leave the page, triggering the Prompt component from `react-router-dom`.
     * @returns {boolean}
     */
    const onNavigateAway = useCallback<Exclude<PromptProps['message'], string>>(
        (location) => {
            if (!isDiscarding.current) {
                setLocation(location)
                setShow(true)
                return false
            }

            return true
        },
        [],
    )

    /**
     * This function triggers the unsaved changes modal to be opened (based on when condition) in a programmatic way.
     * It is useful when you need to prompt the user to save changes before leaving a page section, without changing the route.
     * It is similar to onNavigateAway, but onNavigateAway is attached to the Prompt component from `react-router-dom`
     * The return value is the same as onNavigateAway, just to keep consistency between the two functions.
     * @returns {boolean}
     */
    const onLeaveContext = useCallback(() => {
        if (!isDiscarding.current) {
            setShow(true)
            return false
        }

        return true
    }, [])

    const onClose = useCallback(() => {
        setShow(false)
    }, [])

    return {
        isOpen: show,
        onClose,
        redirectToOriginalLocation,
        onNavigateAway,
        onLeaveContext,
    }
}

export default useUnsavedChangesPrompt
