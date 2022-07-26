import {createContext} from 'react'

export enum FlagKey {
    SelfServiceArticleRecommendation = 'self-service-article-recommendation',
    EarlyAdopter = 'early-adopter',
    DefaultMacroToSearch = 'default-macro-to-search',
    StarterPlanAccess = 'starter-plan-access',
    SelfServiceStandalonePortal = 'self-service-standalone-portal',
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
