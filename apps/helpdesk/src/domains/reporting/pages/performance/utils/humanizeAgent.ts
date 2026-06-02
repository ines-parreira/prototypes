import type { User } from 'config/types/user'

export const humanizeAgent = (agents: User[], entity: string): string => {
    const id = Number(entity)
    if (Number.isNaN(id)) return entity
    return agents.find((agent) => agent.id === id)?.name ?? entity
}
