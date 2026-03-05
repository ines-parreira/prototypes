import { useEffect, useRef } from 'react'

import { useForm } from '@repo/forms'
import { ensureHTTPS } from '@repo/utils'

import type { LinkConfig } from '../utils/customActionTypes'

type LinkFormValues = {
    label: string
    url: string
}

const DEFAULT_VALUES: LinkFormValues = {
    label: '',
    url: '',
}

function toFormValues(link?: LinkConfig): LinkFormValues {
    if (!link) return DEFAULT_VALUES
    return { label: link.label, url: link.url }
}

type UseLinkFormOptions = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (link: LinkConfig) => Promise<void>
    initialLink?: LinkConfig
}

export function useLinkForm({
    isOpen,
    onOpenChange,
    onSubmit,
    initialLink,
}: UseLinkFormOptions) {
    const isEditing = !!initialLink
    const prevIsOpenRef = useRef(false)

    const methods = useForm<LinkFormValues>({
        defaultValues: toFormValues(initialLink),
        mode: 'onChange',
    })

    const {
        handleSubmit,
        reset,
        getValues,
        setValue,
        formState: { isSubmitting, isValid },
    } = methods

    useEffect(() => {
        if (isOpen && !prevIsOpenRef.current) {
            reset(toFormValues(initialLink))
        }
        prevIsOpenRef.current = isOpen
    }, [isOpen, initialLink, reset])

    async function onFormSubmit(values: LinkFormValues) {
        try {
            await onSubmit({
                label: values.label.trim(),
                url: ensureHTTPS(values.url),
            })
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

    function handleUrlBlur() {
        setValue('url', ensureHTTPS(getValues('url')))
    }

    return {
        methods,
        isEditing,
        isValid,
        isSubmitting,
        handleSave: handleSubmit(onFormSubmit),
        handleCancel,
        handleUrlBlur,
    }
}
