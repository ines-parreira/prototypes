import { AiAgentScope } from 'models/aiAgent/types'
import {
    FocusActivationModal,
    getAiSalesAgentEmailEnabledFlag,
} from 'pages/aiAgent/Activation/utils'

import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class EnableSalesSkill extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Enable Shopping Assistant',
            'Boost GMV through automated sales',
            'BASIC',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.aiAgentStoreConfiguration
    }

    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        const conf = data.aiAgentStoreConfiguration
        const emailSet = conf.emailChannelDeactivatedDatetime === null
        const chatSet = conf.chatChannelDeactivatedDatetime === null
        const salesNotEnabled = !conf.scopes.includes(AiAgentScope.Sales)
        const atLeastOneSalesChannelEnabled = chatSet || emailSet
        const ffEnabled = getAiSalesAgentEmailEnabledFlag()
        return salesNotEnabled && atLeastOneSalesChannelEnabled && ffEnabled
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
        data,
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        if (data.isActivationEnabled) {
            const { storeName } = data.aiAgentStoreConfiguration
            return `${aiAgentRoutes.overview}?${FocusActivationModal.buildSearchParam(storeName)}`
        }
        return aiAgentRoutes.settingsChannels
    }
}
