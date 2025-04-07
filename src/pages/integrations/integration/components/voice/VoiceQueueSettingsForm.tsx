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

import {
    CAPACITY_VALIDATION_ERROR,
    RING_TIME_MAX_VALUE,
    RING_TIME_MIN_VALUE,
    RING_TIME_VALIDATION_ERROR,
    WAIT_TIME_MAX_VALUE,
    WAIT_TIME_MIN_VALUE,
    WAIT_TIME_VALIDATION_ERROR,
} from './constants'
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
        let errors = toFormErrors(validator(values))
        if (
            values.ring_time !== undefined &&
            (values.ring_time < RING_TIME_MIN_VALUE ||
                values.ring_time > RING_TIME_MAX_VALUE)
        ) {
            errors['ring_time'] = RING_TIME_VALIDATION_ERROR
        }
        if (
            values.wait_time !== undefined &&
            (values.wait_time < WAIT_TIME_MIN_VALUE ||
                values.wait_time > WAIT_TIME_MAX_VALUE)
        ) {
            errors['wait_time'] = WAIT_TIME_VALIDATION_ERROR
        }
        if (values.capacity !== undefined && values.capacity < 1) {
            errors['capacity'] = CAPACITY_VALIDATION_ERROR
        }
        return errors as Partial<Record<keyof T, unknown>>
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
