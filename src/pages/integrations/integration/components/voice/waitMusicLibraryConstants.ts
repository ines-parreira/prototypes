import {UpdateWaitMusicLibrary, WaitMusicType} from '@gorgias/api-queries'

import {PhoneCountry} from 'models/phoneNumber/types'

export const RINGTONE_AUDIO_FILE_PATHS = [
    {
        country: PhoneCountry.US,
        audioFilePath: 'https://assets.gorgias.io/phone/UsRingTone.mp3',
    },
    {
        country: PhoneCountry.AU,
        audioFilePath:
            'https://github.com/msilvestro/custom-wait-music/raw/refs/heads/main/Australia_ringing_tone.mp3',
    },
    {
        country: PhoneCountry.GB,
        audioFilePath:
            'https://github.com/msilvestro/custom-wait-music/raw/refs/heads/main/UK_ringback_tone.mp3',
    },
]

export const STATIC_WAIT_MUSIC_LIBRARY: UpdateWaitMusicLibrary[] = [
    {
        key: 'clockwork_waltz',
        name: 'Clockwork Waltz',
        audio_file_path: 'https://assets.gorgias.io/phone/ClockworkWaltz.mp3',
    },
    {
        key: 'new_frontier',
        name: 'New Frontier',
        audio_file_path: 'https://assets.gorgias.io/phone/newfrontier.mp3',
    },
    {
        key: 'the_elevator_bossanova',
        name: 'The Elevator Bossanova',
        audio_file_path:
            'https://assets.gorgias.io/phone/theelevatorbossanova.mp3',
    },
    {
        key: 'moonlight_coffee',
        name: 'Moonlight Coffee',
        audio_file_path: 'https://assets.gorgias.io/phone/moonlightcoffee.mp3',
    },
]

export const DEFAULT_WAIT_MUSIC_PREFERENCES = {
    type: WaitMusicType.Library,
    library: STATIC_WAIT_MUSIC_LIBRARY[0],
}
