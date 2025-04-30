import moment from 'moment/moment'

import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class GiveFeedbackAIAgentTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Give feedback to your AI Agent',
            'Coach AI Agent to improve its performance',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.aiAgentStoreConfiguration || !!data?.ticketView
    }

    // AI Agent store was created at least 7 days ago
    protected shouldBeDisplayed({
        aiAgentStoreConfiguration,
    }: RuleEngineData): boolean {
        return moment(aiAgentStoreConfiguration.createdDatetime)
            .add(7, 'days')
            .isSameOrBefore(moment())
    }

    protected getFeatureUrl({
        data: { ticketView: ticketViewData },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        if (!ticketViewData?.viewId) {
            return '/app/views'
        }

        if (!ticketViewData?.ticketId) {
            return `/app/views/${ticketViewData.viewId}`
        }

        return `/app/ticket/${ticketViewData.ticketId}?activeTab=AI_AGENT`
    }
}
