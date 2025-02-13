import {RuleEngineData, RuleEngineRoutes} from '../ruleEngine'
import {Task} from './Task'

export class InstallYourChatTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Install your chat',
            'Installing your chat is mandatory to be able to activate AI Agent',
            'BASIC',
            data,
            routes
        )
    }

    // At least 1 chat integration is not installed
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return data.chatIntegrationsStatus.some((c) => !c.installed)
    }

    protected getFeatureUrl(
        data: RuleEngineData,
        __routes: RuleEngineRoutes
    ): string {
        // We fallback gracefully if the task should not be displayed
        if (!this.shouldBeDisplayed(data)) {
            return ''
        }

        const firstChatNotInstalled = data.chatIntegrationsStatus.find(
            (c) => !c.installed
        )!
        return `/app/settings/channels/gorgias_chat/${firstChatNotInstalled.chatId}/installation`
    }
}
