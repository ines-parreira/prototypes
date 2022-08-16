import {createContext} from 'react'

export enum FlagKey {
    SelfServiceArticleRecommendation = 'self-service-article-recommendation',
    EarlyAdopter = 'early-adopter',
    DefaultMacroToSearch = 'default-macro-to-search',
    SelfServiceStandalonePortal = 'self-service-standalone-portal',
    SelfServiceStatsV2 = 'self-service-stats-v2',
    MacroResponseTextCcBcc = 'macro-response-text-cc-bcc',
}

type ContextSchema = {
    flags: Partial<Record<FlagKey, boolean>>
    getFlag: (key: FlagKey) => boolean
}

const FeatureFlagsContext = createContext<ContextSchema>({
    flags: {},
    getFlag: () => false,
})

export default FeatureFlagsContext
