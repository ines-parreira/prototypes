import {runRuleEngine} from '../ruleEngine'

describe('ruleEngine', () => {
    // Will implements better testing after extracting the list of tasks from the ruleENgine
    it('should test the ruleEngine for codecov', () => {
        const {pendingTasks, completedTasks} = runRuleEngine(
            {
                aiAgentStoreConfiguration: {
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: null,
                } as any,
            },
            {
                aiAgentRoutes: {
                    settingsChannels: 'settingsChannels',
                } as any,
            }
        )
        expect(pendingTasks).toEqual([])
        expect(completedTasks).toHaveLength(2)
    })
})
