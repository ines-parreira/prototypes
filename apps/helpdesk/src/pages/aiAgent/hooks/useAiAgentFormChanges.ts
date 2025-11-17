import { useCallback, useMemo, useRef, useState } from 'react'

import type { ActionCallback } from '../providers/AiAgentFormChangesContext'

export const useAiAgentFormChanges = () => {
    const [dirtyFormSections, setDirtyFormSections] = useState<
        Record<string, boolean>
    >({})

    const actionCallbackMap = useRef<Record<string, ActionCallback>>({})

    const promptTriggerRef = useRef<{
        onLeaveContext: (callback?: ActionCallback) => void
    } | null>(null)

    const isFormDirty = useMemo(() => {
        return Object.values(dirtyFormSections).some((isDirty) => isDirty)
    }, [dirtyFormSections])

    const dirtySections = useMemo(() => {
        return Object.entries(dirtyFormSections)
            .filter(([, isDirty]) => isDirty)
            .map(([type]) => type)
    }, [dirtyFormSections])

    const setIsFormDirty = useCallback(
        (type: string, isDirty: boolean) =>
            setDirtyFormSections((prev) => ({
                ...prev,
                [type]: isDirty,
            })),
        [setDirtyFormSections],
    )

    const setActionCallback = useCallback(
        (section: string, callback: ActionCallback) => {
            actionCallbackMap.current = {
                ...actionCallbackMap.current,
                [section]: callback,
            }
        },
        [actionCallbackMap],
    )

    const onModalSave = useCallback(() => {
        dirtySections.forEach((type) => {
            actionCallbackMap.current[type]?.onSave?.()
        })
    }, [dirtySections, actionCallbackMap])

    const onModalDiscard = useCallback(() => {
        dirtySections.forEach((type) => {
            actionCallbackMap.current[type]?.onDiscard?.()
        })
    }, [dirtySections, actionCallbackMap])

    const onLeaveContext = useCallback(
        (callback?: ActionCallback) => {
            promptTriggerRef.current?.onLeaveContext(callback)
        },
        [promptTriggerRef],
    )

    return {
        isFormDirty,
        dirtySections,
        promptTriggerRef,
        setIsFormDirty,
        setActionCallback,
        onModalSave,
        onModalDiscard,
        onLeaveContext,
    }
}
