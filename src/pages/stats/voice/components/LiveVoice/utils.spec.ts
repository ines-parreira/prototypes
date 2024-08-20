import {LiveCallQueueAgent} from '@gorgias/api-queries'
import {groupAgentsByStatus, AgentStatusCategory} from './utils'

describe('groupAgentsByStatus', () => {
    it('should group agents by status correctly', () => {
        const agents: LiveCallQueueAgent[] = [
            {
                id: 1,
                name: 'Agent 1',
                call_statuses: ['In call' as any],
                is_available_for_call: false,
            },
            {
                id: 2,
                name: 'Agent 2',
                call_statuses: [],
                is_available_for_call: true,
            },
            {
                id: 3,
                name: 'Agent 3',
                call_statuses: ['In call' as any],
                is_available_for_call: true,
            },
            {
                id: 4,
                name: 'Agent 4',
                call_statuses: [],
                is_available_for_call: false,
            },
        ]

        const result = groupAgentsByStatus(agents)

        expect(result[AgentStatusCategory.Busy]).toEqual([
            {
                id: 1,
                name: 'Agent 1',
                call_statuses: ['In call'],
                is_available_for_call: false,
            },
            {
                id: 3,
                name: 'Agent 3',
                call_statuses: ['In call'],
                is_available_for_call: true,
            },
        ])

        expect(result[AgentStatusCategory.Available]).toEqual([
            {
                id: 2,
                name: 'Agent 2',
                call_statuses: [],
                is_available_for_call: true,
            },
        ])

        expect(result[AgentStatusCategory.Unavailable]).toEqual([
            {
                id: 4,
                name: 'Agent 4',
                call_statuses: [],
                is_available_for_call: false,
            },
        ])
    })
})
