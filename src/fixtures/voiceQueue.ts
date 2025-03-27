import {
    PhoneRingingBehaviour,
    VoiceQueue,
    VoiceQueueTargetScope,
    WaitMusicType,
} from '@gorgias/api-queries'

export const voiceQueue: VoiceQueue = {
    id: 1,
    account_id: 1,
    name: 'Test Queue',
    capacity: 100,
    priority_weight: 1,
    distribution_mode: PhoneRingingBehaviour.RoundRobin,
    linked_targets: [
        { team_id: 1, user_id: 1 },
        { team_id: 2, user_id: 2 },
    ],
    ring_time: 30,
    target_scope: VoiceQueueTargetScope.AllAgents,
    wait_time: 120,
    wait_music: {
        type: WaitMusicType.Library,
        library: {
            key: 'chill',
            name: 'Chill While Waiting',
            audio_file_path:
                'https://assets.gorgias.io/phone/waiting_music_chill.mp3',
        },
    },
    agent_ids: [1, 2],
    created_datetime: '2024-01-01T00:00:00.000000+00:00',
    updated_datetime: '2024-01-01T00:00:00.000000+00:00',
    integrations: [],
    wrap_up_time: 30,
}
