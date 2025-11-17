import type { VoiceQueueWaitMusicLibrary } from '@gorgias/helpdesk-queries'
import { VoiceQueueWaitMusicLibraryTypeType } from '@gorgias/helpdesk-queries'

export const RINGTONE_AUDIO_FILE_PATHS = [
    {
        key: 'US_ringing_tone',
        name: 'Ringing Tone - US',
        audio_file_path: 'https://assets.gorgias.io/phone/US_ringing_tone.wav',
    },
    {
        key: 'AU_ringing_tone',
        name: 'Ringing Tone - AU',
        audio_file_path: 'https://assets.gorgias.io/phone/AU_ringing_tone.wav',
    },
    {
        key: 'EU_ringing_tone',
        name: 'Ringing Tone - EU',
        audio_file_path: 'https://assets.gorgias.io/phone/EU_ringing_tone.wav',
    },
    {
        key: 'FR_ringing_tone',
        name: 'Ringing Tone - FR',
        audio_file_path: 'https://assets.gorgias.io/phone/FR_ringing_tone.wav',
    },
    {
        key: 'UK_ringing_tone',
        name: 'Ringing Tone - UK',
        audio_file_path: 'https://assets.gorgias.io/phone/UK_ringing_tone.wav',
    },
]

export const STATIC_WAIT_MUSIC_LIBRARY: VoiceQueueWaitMusicLibrary[] = [
    {
        key: 'chill',
        name: 'Chill While Waiting',
        audio_file_path:
            'https://assets.gorgias.io/phone/waiting_music_chill.mp3',
    },
    {
        key: 'soothe',
        name: 'Soothe',
        audio_file_path:
            'https://assets.gorgias.io/phone/waiting_music_soothe.mp3',
    },
    {
        key: 'uplifting_acoustic',
        name: 'Bright Lights',
        audio_file_path:
            'https://assets.gorgias.io/phone/waiting_music_bright_lights.mp3',
    },
    {
        key: 'clockwork_waltz',
        name: 'Clockwork Waltz',
        audio_file_path: 'https://assets.gorgias.io/phone/ClockworkWaltz.mp3',
    },
]
export const DEFAULT_STATIC_WAIT_MUSIC_LIBRARY_INDEX = 3

export const WAIT_MUSIC_LIBRARY: VoiceQueueWaitMusicLibrary[] = [
    ...RINGTONE_AUDIO_FILE_PATHS,
    ...STATIC_WAIT_MUSIC_LIBRARY,
]

export const DEFAULT_WAIT_MUSIC_PREFERENCES = {
    type: VoiceQueueWaitMusicLibraryTypeType.Library,
    library: STATIC_WAIT_MUSIC_LIBRARY[DEFAULT_STATIC_WAIT_MUSIC_LIBRARY_INDEX],
}

export const QUEUE_DEFAULT_WAIT_MUSIC_PREFERENCES = {
    type: VoiceQueueWaitMusicLibraryTypeType.Library,
    library: STATIC_WAIT_MUSIC_LIBRARY[0],
}
