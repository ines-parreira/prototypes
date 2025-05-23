import { ComponentProps, ReactNode } from 'react'

import { DefaultValues } from 'react-hook-form'

import { CreateVoiceQueue, UpdateVoiceQueue } from '@gorgias/helpdesk-queries'
import {
    validateCreateVoiceQueue,
    validateUpdateVoiceQueue,
} from '@gorgias/helpdesk-validators'

import { Form, toFormErrors } from 'core/forms'

import { DEFAULT_QUEUE_VALUES } from './constants'
import {
    mergeInitialValuesWithDefaultValues,
    queueSettingsCustomValidation,
} from './utils'
import VoiceFormUnsavedChangesPrompt from './VoiceFormUnsavedChangesPrompt'

export default function VoiceQueueSettingsForm<
    T extends UpdateVoiceQueue | CreateVoiceQueue,
>({
    children,
    onSubmit,
    initialValues,
}: {
    children: ReactNode
    onSubmit: ComponentProps<typeof Form<T>>['onValidSubmit']
    initialValues?: UpdateVoiceQueue
}): JSX.Element {
    const validator = (values: T) => {
        const validator = !!initialValues
            ? validateUpdateVoiceQueue
            : validateCreateVoiceQueue
        let errors = toFormErrors(validator(values))

        const customErrors = queueSettingsCustomValidation(values)
        errors = { ...errors, ...customErrors }

        return errors as Partial<Record<keyof T, unknown>>
    }

    return (
        <>
            <Form<T>
                onValidSubmit={onSubmit}
                defaultValues={
                    (initialValues
                        ? mergeInitialValuesWithDefaultValues(initialValues)
                        : DEFAULT_QUEUE_VALUES) as DefaultValues<T>
                }
                mode="onChange"
                resetOptions={{
                    keepDirty: false,
                    keepDefaultValues: false,
                    keepDirtyValues: false,
                }}
                shouldUnregister
                validator={validator}
            >
                {children}
                <VoiceFormUnsavedChangesPrompt onSave={onSubmit} />
            </Form>
        </>
    )
}
