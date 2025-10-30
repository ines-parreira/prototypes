import { VoiceGender, VoiceLanguage } from '@gorgias/helpdesk-types'

export const LANGUAGE_OPTIONS = [
    { id: VoiceLanguage.EnUs, name: 'English - US' },
    { id: VoiceLanguage.EnGb, name: 'English - UK' },
    { id: VoiceLanguage.EnAu, name: 'English - Australia' },
    { id: VoiceLanguage.EsEs, name: 'Spanish - Spain' },
    { id: VoiceLanguage.FrFr, name: 'French - France' },
    { id: VoiceLanguage.FrCa, name: 'French - Canada' },
    { id: VoiceLanguage.DeDe, name: 'German - Germany' },
]

export const GENDER_OPTIONS = [
    { id: VoiceGender.Female, name: 'Female' },
    { id: VoiceGender.Male, name: 'Male' },
]

export const DEFAULT_TTS_LANGUAGE = VoiceLanguage.EnUs
export const DEFAULT_TTS_GENDER = VoiceGender.Female
