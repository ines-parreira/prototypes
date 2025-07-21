import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class UpdateYourChatInstallationTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Update your chat installation',
            'Updating your chat is mandatory to be able to activate AI Agent',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return (
            !!data?.chatIntegrationsStatus || !!data?.pageInteractions !== null
        )
    }

    // If a chat is installed and there are page interactions
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        if (
            data.pageInteractions === null ||
            (data.pageInteractions &&
                Object.keys(data.pageInteractions).length === 0)
        ) {
            return false
        }

        return (
            data.pageInteractions.isConvertChatInstallSnippetEnabled &&
            (data.chatIntegrationsStatus ?? []).some((c) => c.installed) &&
            data.pageInteractions.pageInteractions.length > 0
        )
    }

    protected getFeatureUrl({
        data,
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        // We fallback gracefully if the task should not be displayed
        if (!this.shouldBeDisplayed(data)) {
            return ''
        }

        const firstChatInstalled = (data.chatIntegrationsStatus ?? []).find(
            (c) => c.installed,
        )!
        return `/app/settings/channels/gorgias_chat/${firstChatInstalled.chatId}/installation`
    }
}
