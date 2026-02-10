import type { AgentStatusWithSystem } from '../../types'

export type AgentAvailabilityStatusSelectProps = {
    activeAvailabilityStatus?: AgentStatusWithSystem
    onSelect: (status: AgentStatusWithSystem) => void
    placeholder?: string
    isDisabled?: boolean
}
