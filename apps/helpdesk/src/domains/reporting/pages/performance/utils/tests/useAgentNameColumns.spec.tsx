import { assumeMock, renderHook } from '@repo/testing'

import type { User } from 'config/types/user'
import { useAgentNameColumns } from 'domains/reporting/pages/performance/utils/useAgentNameColumns'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'

jest.mock('domains/reporting/state/ui/stats/agentPerformanceSlice', () => ({
    ...jest.requireActual(
        'domains/reporting/state/ui/stats/agentPerformanceSlice',
    ),
    getFilteredAgents: jest.fn(() => []),
}))

const mockGetFilteredAgents = assumeMock(getFilteredAgents)

const MOCK_AGENTS: User[] = [
    {
        id: 1,
        name: 'Alice Anderson',
        meta: { profile_picture_url: 'https://example.com/alice.png' },
    } as unknown as User,
    { id: 2, name: 'Bob Brown' } as unknown as User,
]

beforeEach(() => {
    jest.clearAllMocks()
    mockGetFilteredAgents.mockReturnValue(MOCK_AGENTS)
})

describe('useAgentNameColumns', () => {
    it('returns a single Agent entity column', () => {
        const { result } = renderHook(() => useAgentNameColumns())

        expect(result.current).toHaveLength(1)
        expect(result.current[0].accessor).toBe('entity')
        expect(result.current[0].label).toBe('Agent')
    })

    it('humanizes the agent name from the store', () => {
        const { result } = renderHook(() => useAgentNameColumns())

        expect(result.current[0].formatName?.('1')).toBe('Alice Anderson')
    })

    it('falls back to the raw id when the agent is missing from the store', () => {
        const { result } = renderHook(() => useAgentNameColumns())

        expect(result.current[0].formatName?.('999')).toBe('999')
    })

    it('resolves avatar name and url from the agent meta', () => {
        const { result } = renderHook(() => useAgentNameColumns())

        expect(result.current[0].getAvatarProps?.('1')).toEqual({
            name: 'Alice Anderson',
            url: 'https://example.com/alice.png',
        })
    })

    it('returns the entity and an undefined url when the agent has no profile picture', () => {
        const { result } = renderHook(() => useAgentNameColumns())

        expect(result.current[0].getAvatarProps?.('2')).toEqual({
            name: 'Bob Brown',
            url: undefined,
        })
    })

    it('falls back to the raw entity for the avatar name when the agent is unknown', () => {
        const { result } = renderHook(() => useAgentNameColumns())

        expect(result.current[0].getAvatarProps?.('999')).toEqual({
            name: '999',
            url: undefined,
        })
    })
})
