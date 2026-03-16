import { useEffect, useRef } from 'react'

import { useForm, useWatch } from '@repo/forms'

import {
    INITIAL_ACTION,
    METHODS_WITH_BODY,
} from '../utils/customActionConstants'
import type { ButtonAction, ButtonConfig } from '../utils/customActionTypes'
import { trimLeftoverData } from '../utils/customActionUtils'

type ButtonFormValues = {
    label: string
    action: ButtonAction
}

const DEFAULT_VALUES: ButtonFormValues = {
    label: '',
    action: INITIAL_ACTION,
}

function toFormValues(button?: ButtonConfig): ButtonFormValues {
    if (!button) return DEFAULT_VALUES
    return { label: button.label, action: button.action }
}

type UseButtonFormOptions = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (button: ButtonConfig) => Promise<void>
    editButton?: ButtonConfig
}

export function useButtonForm({
    isOpen,
    onOpenChange,
    onSubmit,
    editButton,
}: UseButtonFormOptions) {
    const isEditing = !!editButton
    const prevIsOpenRef = useRef(false)

    const methods = useForm<ButtonFormValues>({
        defaultValues: toFormValues(editButton),
        mode: 'onChange',
    })

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting, isValid },
    } = methods

    useEffect(() => {
        if (isOpen && !prevIsOpenRef.current) {
            reset(toFormValues(editButton))
        }
        prevIsOpenRef.current = isOpen
    }, [isOpen, editButton, reset])

    const method = useWatch({ control, name: 'action.method' })
    const hasBody = METHODS_WITH_BODY.includes(method)

    async function onFormSubmit(values: ButtonFormValues) {
        const result = trimLeftoverData({
            label: values.label.trim(),
            action: values.action,
        })
        try {
            await onSubmit(result)
            reset()
            onOpenChange(false)
        } catch {
            // Dialog stays open with current state — user can retry
        }
    }

    function handleCancel() {
        reset()
        onOpenChange(false)
    }

    return {
        methods,
        isEditing,
        isValid,
        isSubmitting,
        hasBody,
        handleSave: handleSubmit(onFormSubmit),
        handleCancel,
    }
}
