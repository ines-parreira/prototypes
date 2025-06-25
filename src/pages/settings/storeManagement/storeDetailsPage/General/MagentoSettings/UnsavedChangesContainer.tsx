import React, { useCallback, useRef } from 'react'

import { useFormContext } from 'react-hook-form'

import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

interface UnsavedChangesContainerProps {
    handleUpdate: (values: Record<string, string>) => void
}

export default function UnsavedChangesContainer({
    handleUpdate,
}: UnsavedChangesContainerProps) {
    const promptRef = useRef<{ onLeaveContext: () => void }>(null)
    const { formState, getValues } = useFormContext()

    const onSave = useCallback(() => {
        const values = getValues()
        handleUpdate(values)
    }, [handleUpdate, getValues])

    return (
        <UnsavedChangesPrompt
            ref={promptRef}
            shouldShowSaveButton
            shouldShowDiscardButton
            onSave={onSave}
            when={formState.isDirty}
        />
    )
}
