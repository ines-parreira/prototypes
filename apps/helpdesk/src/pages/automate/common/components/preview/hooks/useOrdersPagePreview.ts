import { useEffect, useRef, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useHistory } from 'react-router-dom'

import { SELF_SERVICE_PREVIEW_ROUTES } from '../constants'
import { useSelfServicePreviewContext } from '../SelfServicePreviewContext'

export enum PreviewStep {
    INITIAL,
    TRACK_HOVER,
    TRACK_HOVERING,
    TRACK_CLICK,
}

const useOrdersPagePreview = () => {
    const { orderManagementFlow } = useSelfServicePreviewContext()
    const [previewStep, setPreviewStep] = useState(PreviewStep.INITIAL)
    const timeout = useRef<number>()
    const history = useHistory()

    useEffect(() => {
        switch (previewStep) {
            case PreviewStep.INITIAL:
                switch (orderManagementFlow) {
                    case 'trackOrderPolicy':
                        timeout.current = window.setTimeout(() => {
                            setPreviewStep(PreviewStep.TRACK_HOVER)
                        }, Duration.millis(800))
                }

                break
            case PreviewStep.TRACK_HOVER:
                timeout.current = window.setTimeout(() => {
                    setPreviewStep(PreviewStep.TRACK_HOVERING)
                }, Duration.seconds(1))
                break
            case PreviewStep.TRACK_HOVERING:
                timeout.current = window.setTimeout(() => {
                    setPreviewStep(PreviewStep.TRACK_CLICK)
                }, Duration.millis(200))
                break
            case PreviewStep.TRACK_CLICK:
                timeout.current = window.setTimeout(() => {
                    history.push(SELF_SERVICE_PREVIEW_ROUTES.TRACK)
                }, Duration.millis(200))
        }

        return () => {
            clearTimeout(timeout.current)
        }
    }, [previewStep, orderManagementFlow, history])

    return { previewStep }
}

export default useOrdersPagePreview
