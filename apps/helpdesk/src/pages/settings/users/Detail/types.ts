import { UserRole } from 'config/types/user'

export type AgentState = {
    name: string
    email: string
    role: UserRole
}
