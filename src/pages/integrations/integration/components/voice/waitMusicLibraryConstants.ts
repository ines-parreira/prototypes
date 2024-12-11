import {UpdateWaitMusicLibrary, WaitMusicType} from '@gorgias/api-queries'

const EUROPEAN_COUNTRY_CODES = [
    'AL',
    'AD',
    'AT',
    'BY',
    'BE',
    'BA',
    'BG',
    'HR',
    'CY',
    'CZ',
    'DK',
    'EE',
    'FO',
    'FI',
    'DE',
    'GI',
    'GR',
    'GG',
    'HU',
    'IS',
    'IM',
    'IT',
    'JE',
    'XK',
    'LV',
    'LI',
    'LT',
    'LU',
    'MT',
    'MD',
    'MC',
    'ME',
    'NL',
    'NO',
    'PL',
    'PT',
    'MK',
    'RO',
    'SM',
    'RS',
    'SK',
    'SI',
    'ES',
    'SE',
    'CH',
    'UA',
    'VA',
]
export const RINGTONE_AUDIO_FILE_PATHS = [
    {
        countries: ['US', 'CA'],
        audioFilePath: 'https://assets.gorgias.io/phone/US_ringing_tone.wav',
    },
    {
        countries: ['AU'],
        audioFilePath: 'https://assets.gorgias.io/phone/AU_ringing_tone.wav',
    },
    {
        countries: EUROPEAN_COUNTRY_CODES,
        audioFilePath: 'https://assets.gorgias.io/phone/EU_ringing_tone.wav',
    },
    {
        countries: ['FR'],
        audioFilePath: 'https://assets.gorgias.io/phone/FR_ringing_tone.wav',
    },
    {
        countries: ['GB', 'GG', 'IE', 'IM', 'JE', 'NZ'],
        audioFilePath: 'https://assets.gorgias.io/phone/UK_ringing_tone.wav',
    },
]
export const DEFAULT_RINGTONE_AUDIO_FILE_PATHS_INDEX = 0

export const STATIC_WAIT_MUSIC_LIBRARY: UpdateWaitMusicLibrary[] = [
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
        key: 'clockwork_waltz',
        name: 'Clockwork Waltz',
        audio_file_path: 'https://assets.gorgias.io/phone/ClockworkWaltz.mp3',
    },
]
export const DEFAULT_STATIC_WAIT_MUSIC_LIBRARY_INDEX = 2

export const DEFAULT_WAIT_MUSIC_PREFERENCES = {
    type: WaitMusicType.Library,
    library: STATIC_WAIT_MUSIC_LIBRARY[DEFAULT_STATIC_WAIT_MUSIC_LIBRARY_INDEX],
}
