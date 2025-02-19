import moment from 'moment/moment'

import {GiveFeedbackAIAgentTask} from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/GiveFeedbackAIAgent.task'
import {
    buildRuleEngineData,
    buildRuleEngineRoutes,
} from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/tests/utils'
import {AiAgentStoreConfigurationFixture} from 'pages/aiAgent/Overview/hooks/pendingTasks/tests/AiAgentStoreConfiguration.fixture'

describe('GiveFeedbackAIAgentTask', () => {
    it('should display the task if the AI Agent was installed 7 days ago', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withCreatedDatetime(moment().subtract(7, 'days').toISOString())
                .build()

        const task = new GiveFeedbackAIAgentTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(true)
    })

    it('should display the task if the AI Agent was installed 8 days ago', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withCreatedDatetime(moment().subtract(8, 'days').toISOString())
                .build()

        const task = new GiveFeedbackAIAgentTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task if the AI Agent was installed 6 days ago', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withCreatedDatetime(moment().subtract(6, 'days').toISOString())
                .build()

        const task = new GiveFeedbackAIAgentTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(false)
    })

    it('should return root view when no viewId', () => {
        const task = new GiveFeedbackAIAgentTask(
            buildRuleEngineData({
                ticketView: {viewId: undefined},
            }),
            buildRuleEngineRoutes()
        )
        expect(task.featureUrl).toBe('/app/views')
    })

    it('should return view/viewId when viewId exists and no ticketId', () => {
        const task = new GiveFeedbackAIAgentTask(
            buildRuleEngineData({
                ticketView: {viewId: 123, ticketId: undefined},
            }),
            buildRuleEngineRoutes()
        )
        expect(task.featureUrl).toBe('/app/views/123')
    })

    it('should return view/viewId/ticketId when viewId and ticketId exist', () => {
        const task = new GiveFeedbackAIAgentTask(
            buildRuleEngineData({
                ticketView: {viewId: 123, ticketId: 456},
            }),
            buildRuleEngineRoutes()
        )
        expect(task.featureUrl).toBe('/app/ticket/456?activeTab=AI_AGENT')
    })
})
