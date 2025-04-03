import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

import { Prompt } from 'react-router-dom'

import UnsavedChangesModal, {
    UnsavedChangesModalProps,
} from './UnsavedChangesModal'
import useUnsavedChangesPrompt from './useUnsavedChangesPrompt'

type UnsavedChangesPromptProps = {
    onDiscard?: () => void
    onSave: () => Promise<unknown> | void
    shouldRedirectAfterSave?: boolean
    when: boolean | undefined
} & Pick<
    UnsavedChangesModalProps,
    'shouldShowDiscardButton' | 'shouldShowSaveButton' | 'body' | 'title'
>

type TriggerCallback = {
    onSave?: () => Promise<unknown> | void
    onDiscard?: () => Promise<unknown> | void
    onClose?: () => Promise<unknown> | void
}

export type UnsavedChangesPromptTrigger = {
    onLeaveContext: (callback?: TriggerCallback) => void
}

const UnsavedChangesPrompt = forwardRef<
    UnsavedChangesPromptTrigger,
    UnsavedChangesPromptProps
>(
    (
        { onDiscard, onSave, shouldRedirectAfterSave, when, ...modalProps },
        ref,
    ) => {
        const triggerCallbackRef = useRef<TriggerCallback>()

        const {
            isOpen,
            onClose,
            redirectToOriginalLocation,
            onNavigateAway,
            onLeaveContext,
        } = useUnsavedChangesPrompt({ when })

        const handleLeaveContext = useCallback(
            (callback?: TriggerCallback) => {
                triggerCallbackRef.current = callback

                onLeaveContext()
            },
            [onLeaveContext],
        )

        const handleDiscard = useCallback(() => {
            onClose()
            onDiscard && onDiscard()
            redirectToOriginalLocation()

            triggerCallbackRef.current?.onDiscard?.()

            triggerCallbackRef.current = undefined
        }, [onClose, onDiscard, redirectToOriginalLocation])

        const handleSave = useCallback(async () => {
            if (shouldRedirectAfterSave) {
                await onSave()
                    ?.then(redirectToOriginalLocation)
                    .catch(() => onClose())
            } else {
                await onSave()?.catch(() => onClose())
            }

            onClose()

            triggerCallbackRef.current?.onSave?.()

            triggerCallbackRef.current = undefined
        }, [
            onClose,
            onSave,
            redirectToOriginalLocation,
            shouldRedirectAfterSave,
        ])

        const handleClose = useCallback(() => {
            onClose()

            triggerCallbackRef.current?.onClose?.()

            triggerCallbackRef.current = undefined
        }, [onClose])

        // this is used to trigger the onLeaveContext callback outside of the component
        useImperativeHandle(
            ref,
            () => ({
                onLeaveContext: handleLeaveContext,
            }),
            [handleLeaveContext],
        )

        return (
            <>
                <Prompt when={when} message={onNavigateAway} />
                <UnsavedChangesModal
                    {...modalProps}
                    onDiscard={handleDiscard}
                    isOpen={isOpen}
                    onClose={handleClose}
                    onSave={handleSave}
                />
            </>
        )
    },
)

export default UnsavedChangesPrompt
