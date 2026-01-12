// @repo/agent-status

export { AgentStatusesTable } from './components'
export { DeleteStatusConfirmationModal } from './components/DeleteStatusModal'

export { DURATION_OPTIONS, SYSTEM_STATUSES, VALIDATION } from './constants'

export {
    useAgentStatuses,
    useDeleteCustomUserAvailabilityStatus,
    useDeleteCustomUserAvailabilityStatusModal,
} from './hooks'

export type { AgentStatusWithSystem, DurationOption } from './types'
export { CreateAgentStatusModal } from './components/CreateAgentStatusModal/CreateAgentStatusModal'
export type { CreateAgentStatusModalProps } from './components/CreateAgentStatusModal/types'

export { StatusDurationSelect } from './components/StatusDurationSelect'
export type { StatusDurationSelectProps } from './components/StatusDurationSelect'

// Hooks
export { useCreateAgentStatus } from './hooks/useCreateAgentStatus'

export {
    AgentStatusLegacyBridgeProvider,
    useAgentStatusLegacyBridge,
} from './utils/LegacyBridge'
export { NotificationStatus } from './utils/LegacyBridge/context'
