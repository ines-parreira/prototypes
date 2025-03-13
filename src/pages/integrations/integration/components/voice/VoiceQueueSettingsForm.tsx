import React, { ComponentProps, ReactNode } from 'react'

import {
    PhoneRingingBehaviour,
    UpdateVoiceQueue,
    VoiceQueueTargetScope,
} from '@gorgias/api-queries'

import { Form } from 'core/forms'

import { DEFAULT_WAIT_MUSIC_PREFERENCES } from './waitMusicLibraryConstants'

type Props = {
    children: ReactNode
    onSubmit: ComponentProps<typeof Form>['onValidSubmit']
}

export default function VoiceQueueSettingsForm({
    children,
    onSubmit,
}: Props): JSX.Element {
    return (
        <Form<UpdateVoiceQueue>
            onValidSubmit={onSubmit}
            defaultValues={DEFAULT_VALUES}
            mode="onChange"
            resetOptions={{
                keepDirty: false,
                keepDefaultValues: false,
            }}
        >
            {children}
        </Form>
    )
}

const DEFAULT_VALUES: UpdateVoiceQueue = {
    name: '',
    capacity: 100,
    priority_weight: 100,
    distribution_mode: PhoneRingingBehaviour.RoundRobin,
    ring_time: 30,
    target_scope: VoiceQueueTargetScope.AllAgents,
    wait_time: 120,
    wait_music: DEFAULT_WAIT_MUSIC_PREFERENCES,
}
