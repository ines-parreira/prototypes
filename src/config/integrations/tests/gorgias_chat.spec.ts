import {GorgiasChatIntegrationMeta} from 'models/integration/types'
import {Language} from 'constants/languages'

import {
    getLanguagesFromChatConfig,
    getPrimaryLanguageFromChatConfig,
} from '../gorgias_chat'

describe('getLanguagesFromChatConfig', () => {
    it('should return an array of languages if meta.languages exists', () => {
        const meta = {
            languages: [
                {language: Language.EnglishUs, primary: true},
                {language: Language.FrenchFr, primary: false},
            ],
        } as Partial<GorgiasChatIntegrationMeta> as GorgiasChatIntegrationMeta
        const result = getLanguagesFromChatConfig(meta)
        expect(result).toEqual([Language.EnglishUs, Language.FrenchFr])
    })

    it('should return an array with "en-US" as a default language if meta.language and meta.languages are undefined', () => {
        const meta =
            {} as Partial<GorgiasChatIntegrationMeta> as GorgiasChatIntegrationMeta
        const result = getLanguagesFromChatConfig(meta)
        expect(result).toEqual([Language.EnglishUs])
    })

    it('should return an array with meta.language if meta.languages is undefined', () => {
        const meta = {
            language: Language.FrenchFr,
        } as Partial<GorgiasChatIntegrationMeta> as GorgiasChatIntegrationMeta
        const result = getLanguagesFromChatConfig(meta)
        expect(result).toEqual([Language.FrenchFr])
    })
})

describe('getPrimaryLanguageFromChatConfig', () => {
    it('should return the primary language from meta.languages', () => {
        const meta = {
            languages: [
                {language: Language.FrenchFr, primary: true},
                {language: Language.EnglishUs},
            ],
        } as Partial<GorgiasChatIntegrationMeta> as GorgiasChatIntegrationMeta
        const result = getPrimaryLanguageFromChatConfig(meta)
        expect(result).toBe(Language.FrenchFr)
    })

    it('should return "en-US" if both meta.language and meta.languages are undefined', () => {
        const meta =
            {} as Partial<GorgiasChatIntegrationMeta> as GorgiasChatIntegrationMeta
        const result = getPrimaryLanguageFromChatConfig(meta)
        expect(result).toBe(Language.EnglishUs)
    })

    it('should return meta.language if meta.languages is undefined', () => {
        const meta = {
            language: Language.FrenchFr,
        } as Partial<GorgiasChatIntegrationMeta> as GorgiasChatIntegrationMeta
        const result = getPrimaryLanguageFromChatConfig(meta)
        expect(result).toBe(Language.FrenchFr)
    })

    it('should return "en-US" if no primary language is specified in meta.languages', () => {
        const meta = {
            languages: [
                {language: Language.EnglishUs},
                {language: Language.FrenchFr},
            ],
        } as Partial<GorgiasChatIntegrationMeta> as GorgiasChatIntegrationMeta
        const result = getPrimaryLanguageFromChatConfig(meta)
        expect(result).toBe(Language.EnglishUs)
    })
})
