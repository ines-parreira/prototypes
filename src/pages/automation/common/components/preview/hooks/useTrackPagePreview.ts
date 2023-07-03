import {useEffect, useRef, useState} from 'react'
import {useHistory} from 'react-router-dom'

import {SELF_SERVICE_PREVIEW_ROUTES} from '../constants'

enum PreviewStep {
    INITIAL,
    SCROLL,
}

const useTrackPagePreview = () => {
    const [previewStep, setPreviewStep] = useState(PreviewStep.INITIAL)
    const ref = useRef<HTMLDivElement>(null)
    const timeout = useRef<number>()
    const history = useHistory()

    useEffect(() => {
        switch (previewStep) {
            case PreviewStep.INITIAL:
                timeout.current = window.setTimeout(() => {
                    if (ref.current) {
                        ref.current.scrollTo({
                            top: ref.current.scrollHeight,
                            behavior: 'smooth',
                        })
                    }

                    setPreviewStep(PreviewStep.SCROLL)
                }, 2000)
                break
            case PreviewStep.SCROLL:
                timeout.current = window.setTimeout(() => {
                    history.push(SELF_SERVICE_PREVIEW_ROUTES.ORDERS)
                }, 2500)
        }

        return () => {
            clearTimeout(timeout.current)
        }
    }, [previewStep, history])

    return {ref}
}

export default useTrackPagePreview
