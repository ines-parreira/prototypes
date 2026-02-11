import { useEffect, useRef } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

type FieldType = 'input' | 'select' | 'textarea' | 'slider' | 'toggle'

interface UseTrackFieldValueParams {
    currentStep: number
    stepName?: string
    shopName?: string
    fieldName: string
    fieldType: FieldType
    fieldValue: string | number | boolean | undefined
    debounceMs?: number
}

export function useTrackFieldValue({
    currentStep,
    stepName = 'unknown',
    shopName = 'unknown',
    fieldName,
    fieldType,
    fieldValue,
    debounceMs = 0,
}: UseTrackFieldValueParams) {
    const debounceTimerRef = useRef<NodeJS.Timeout>()
    const previousValueRef = useRef<string | number | boolean | undefined>(
        fieldValue,
    )
    const isInitialRenderRef = useRef(true)

    useEffect(() => {
        if (isInitialRenderRef.current) {
            isInitialRenderRef.current = false
            previousValueRef.current = fieldValue
            return
        }

        if (fieldValue === previousValueRef.current) {
            return
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        const trackFieldChange = () => {
            logEvent(SegmentEvent.AiAgentOnboardingFieldValueUpdated, {
                onboardingFlow: 'wizard',
                stepName,
                stepNumber: currentStep,
                fieldName,
                fieldType,
                fieldValue: String(fieldValue ?? ''),
                shopName,
            })
            previousValueRef.current = fieldValue
        }

        if (debounceMs > 0) {
            debounceTimerRef.current = setTimeout(trackFieldChange, debounceMs)
        } else {
            trackFieldChange()
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [
        fieldValue,
        currentStep,
        stepName,
        shopName,
        fieldName,
        fieldType,
        debounceMs,
    ])
}
