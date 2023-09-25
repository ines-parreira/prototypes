import {LanguageChat} from 'constants/languages'
import {GorgiasChatMinimumSnippetVersion} from 'models/integration/types'

export type Translations = {
    texts: Record<string, string>
    sspTexts: Record<string, string>
    meta: Record<string, string>
}

export type TextsPerLanguage = {
    texts: Record<string, string>
    sspTexts: Record<string, string>
    meta: Record<string, string>
}

export type TextsLegacyMonoLanguage = TextsPerLanguage

export type TextsMultiLanguage = {
    [LanguageChat.Czech]: TextsPerLanguage
    [LanguageChat.Danish]: TextsPerLanguage
    [LanguageChat.Dutch]: TextsPerLanguage
    [LanguageChat.EnglishUs]: TextsPerLanguage
    [LanguageChat.FrenchCa]: TextsPerLanguage
    [LanguageChat.FrenchFr]: TextsPerLanguage
    [LanguageChat.German]: TextsPerLanguage
    [LanguageChat.Italian]: TextsPerLanguage
    [LanguageChat.Norwegian]: TextsPerLanguage
    [LanguageChat.Spanish]: TextsPerLanguage
    [LanguageChat.Swedish]: TextsPerLanguage
}

export type Texts = TextsLegacyMonoLanguage | TextsMultiLanguage

export type InstallationStatus = {
    applicationId: number
    hasBeenRequestedOnce: boolean
    installed: boolean
    minimumSnippetVersion: GorgiasChatMinimumSnippetVersion | null
}

export type Agent = {
    avatarUrl: string | null
    name: string
}

export type AplicationAgentsResponse = {
    agents: Agent[]
    hasActiveAndAvailableAgents: boolean
    hasAvailableAgents: boolean
    isActive: boolean
}
