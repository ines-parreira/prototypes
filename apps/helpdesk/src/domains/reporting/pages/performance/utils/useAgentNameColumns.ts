import { useMemo } from 'react'

import type { NameColumnConfig } from '@repo/reporting'

import { humanizeAgent } from 'domains/reporting/pages/performance/utils/humanizeAgent'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { useAppSelector } from 'hooks/useAppSelector'

export const useAgentNameColumns = (): NameColumnConfig[] => {
    const agents = useAppSelector(getFilteredAgents)

    return useMemo<NameColumnConfig[]>(
        () => [
            {
                accessor: 'entity',
                label: 'Agent',
                formatName: (entity: string) => humanizeAgent(agents, entity),
                getAvatarProps: (entity: string) => {
                    const agent = agents.find((a) => a.id === Number(entity))
                    return {
                        name: agent?.name ?? entity,
                        url: agent?.meta?.profile_picture_url ?? undefined,
                    }
                },
            },
        ],
        [agents],
    )
}
