type AccessActions = { canRead: boolean; canWrite: boolean }

type StandaloneAiAccessFixtureOptions = {
    isStandaloneAiAgent?: boolean
    statistics?: AccessActions
    userManagement?: AccessActions
}

export const createMockStandaloneAiAccess = ({
    isStandaloneAiAgent = false,
    statistics = { canRead: false, canWrite: false },
    userManagement = { canRead: false, canWrite: false },
}: StandaloneAiAccessFixtureOptions = {}) => ({
    isStandaloneAiAgent,
    accessFeaturesMapped: {
        statistics,
        userManagement,
    },
})
