import { SetupAiAgentTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/SetupAiAgent.task'

import { buildRuleEngineRoutes } from './utils'

describe('SetupAiAgent', () => {
    it('should always display the task', () => {
        const task = new SetupAiAgentTask(buildRuleEngineRoutes())

        expect(task.display).toBe(true)
    })
})
