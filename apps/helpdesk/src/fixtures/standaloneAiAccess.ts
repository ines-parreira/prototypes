type AccessActions = { canRead: boolean; canWrite: boolean }
type TicketViewActions = AccessActions & { canCreateInternalNote: boolean }

type StandaloneAiAccess = {
    accessFeaturesMapped: {
        statistics: AccessActions
        userManagement: AccessActions
        ticketsView: TicketViewActions
    }
    isStandaloneAiAgent: boolean
}

type StandaloneAiAccessFixtureOptions = Partial<StandaloneAiAccess> & {
    statistics?: Partial<AccessActions>
    userManagement?: Partial<AccessActions>
    ticketsView?: Partial<TicketViewActions>
}

const defaultStandaloneAiAccess: StandaloneAiAccess = {
    accessFeaturesMapped: {
        statistics: {
            canRead: false,
            canWrite: false,
        },
        userManagement: {
            canRead: false,
            canWrite: false,
        },
        ticketsView: {
            canRead: false,
            canCreateInternalNote: false,
            canWrite: false,
        },
    },
    isStandaloneAiAgent: false,
}

export function createMockStandaloneAiAccess(
    overrides: StandaloneAiAccessFixtureOptions = {},
): StandaloneAiAccess {
    const {
        accessFeaturesMapped,
        statistics,
        ticketsView,
        userManagement,
        ...rest
    } = overrides

    return {
        ...defaultStandaloneAiAccess,
        ...rest,
        accessFeaturesMapped: {
            ...defaultStandaloneAiAccess.accessFeaturesMapped,
            ...accessFeaturesMapped,
            statistics: {
                ...defaultStandaloneAiAccess.accessFeaturesMapped.statistics,
                ...statistics,
                ...accessFeaturesMapped?.statistics,
            },
            userManagement: {
                ...defaultStandaloneAiAccess.accessFeaturesMapped
                    .userManagement,
                ...userManagement,
                ...accessFeaturesMapped?.userManagement,
            },
            ticketsView: {
                ...defaultStandaloneAiAccess.accessFeaturesMapped.ticketsView,
                ...ticketsView,
                ...accessFeaturesMapped?.ticketsView,
            },
        },
    }
}
