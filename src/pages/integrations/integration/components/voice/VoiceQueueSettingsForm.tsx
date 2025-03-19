import { ComponentProps, ReactNode } from 'react'

import { DefaultValues } from 'react-hook-form'

import {
    CreateVoiceQueue,
    PhoneRingingBehaviour,
    UpdateVoiceQueue,
    VoiceQueueTargetScope,
} from '@gorgias/api-queries'
import {
    validateCreateVoiceQueue,
    validateUpdateVoiceQueue,
} from '@gorgias/api-validators'

import { Form, toFormErrors } from 'core/forms'

import VoiceFormUnsavedChangesPrompt from './VoiceFormUnsavedChangesPrompt'
import { QUEUE_DEFAULT_WAIT_MUSIC_PREFERENCES } from './waitMusicLibraryConstants'

export default function VoiceQueueSettingsForm<
    T extends UpdateVoiceQueue | CreateVoiceQueue,
>({
    children,
    onSubmit,
    initialValues,
}: {
    children: ReactNode
    onSubmit: ComponentProps<typeof Form<T>>['onValidSubmit']
    initialValues?: T
}): JSX.Element {
    const validator = (values: T) => {
        const validator = !!initialValues
            ? validateUpdateVoiceQueue
            : validateCreateVoiceQueue
        return toFormErrors(validator(values)) as Partial<
            Record<keyof T, unknown>
        >
    }

    return (
        <>
            <Form<T>
                onValidSubmit={onSubmit}
                defaultValues={
                    (initialValues ?? DEFAULT_VALUES) as DefaultValues<T>
                }
                mode="onChange"
                resetOptions={{
                    keepDirty: false,
                    keepDefaultValues: false,
                    keepDirtyValues: false,
                }}
                validator={validator}
            >
                {children}
                <VoiceFormUnsavedChangesPrompt onSave={onSubmit} />
            </Form>
        </>
    )
}

const DEFAULT_VALUES: UpdateVoiceQueue | CreateVoiceQueue = {
    name: '',
    capacity: 100,
    priority_weight: 100,
    distribution_mode: PhoneRingingBehaviour.RoundRobin,
    linked_targets: [],
    ring_time: 30,
    target_scope: VoiceQueueTargetScope.AllAgents,
    wait_time: 120,
    wait_music: QUEUE_DEFAULT_WAIT_MUSIC_PREFERENCES,
}
