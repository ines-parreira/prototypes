import React, { ComponentProps, ReactNode } from 'react'

import { DefaultValues } from 'react-hook-form'

import {
    CreateVoiceQueue,
    PhoneRingingBehaviour,
    UpdateVoiceQueue,
    VoiceQueue,
    VoiceQueueTargetScope,
} from '@gorgias/api-queries'

import { Form } from 'core/forms'

import VoiceFormUnsavedChangesPrompt from './VoiceFormUnsavedChangesPrompt'
import { DEFAULT_WAIT_MUSIC_PREFERENCES } from './waitMusicLibraryConstants'

export default function VoiceQueueSettingsForm<
    T extends UpdateVoiceQueue | CreateVoiceQueue | VoiceQueue,
>({
    children,
    onSubmit,
}: {
    children: ReactNode
    onSubmit: ComponentProps<typeof Form<T>>['onValidSubmit']
}): JSX.Element {
    // TODO: Uncomment when all fields are added to the form
    // const validator = (values: T) => {
    //     return toFormErrors(validateVoiceQueue(values)) as Partial<
    //         Record<keyof T, unknown>
    //     >
    // }

    return (
        <>
            <Form<T>
                onValidSubmit={onSubmit}
                defaultValues={DEFAULT_VALUES as DefaultValues<T>}
                mode="onChange"
                resetOptions={{
                    keepDirty: false,
                    keepDefaultValues: false,
                    keepDirtyValues: false,
                }}
                // validator={validator}
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
    wait_music: DEFAULT_WAIT_MUSIC_PREFERENCES,
}
