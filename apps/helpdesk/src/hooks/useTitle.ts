import { useEffect } from 'react'

export const TITLE_RESET_DELAY = 200

const originalTitle = (document && document.title) || 'Gorgias'

let globalTimer: number

function useTitle(title?: string) {
    useEffect(() => {
        // In case useTitle is called empty, we want the timeout from the
        // previous hook call to run in order to reset the title
        if (!title) {
            return
        }

        clearTimeout(globalTimer)

        if (title !== document.title) {
            document.title = title
        }

        return () => {
            globalTimer = window.setTimeout(() => {
                document.title = originalTitle
            }, TITLE_RESET_DELAY)
        }
    }, [title])
}

export default useTitle
