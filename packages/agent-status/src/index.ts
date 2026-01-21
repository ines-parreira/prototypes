// @repo/agent-status

export { AgentStatusesTable } from './components'
export { DeleteStatusConfirmationModal } from './components/DeleteStatusModal'
export { UserInfoHeader, UserInfoHeaderContainer } from './components'
export type { UserInfoHeaderProps } from './components/UserInfoHeader'

export {
    DURATION_LIMITS,
    DURATION_OPTIONS,
    DURATION_UNIT_OPTIONS,
    SYSTEM_STATUSES,
    VALIDATION,
} from './constants'

export {
    useAgentStatuses,
    useDeleteCustomUserAvailabilityStatus,
    useCustomUserUnavailabilityModal,
    useAvailabilityStatusColor,
} from './hooks'

export type { AgentStatusWithSystem, DurationOption } from './types'

export { EditAgentStatusModal } from './components/EditAgentStatusModal'
export type { EditAgentStatusModalProps } from './components/EditAgentStatusModal'

export { CreateAgentStatusModal } from './components/CreateAgentStatusModal'
export type { CreateAgentStatusModalProps } from './components/CreateAgentStatusModal'

export { StatusDurationSelect } from './components/StatusDurationSelect'
export type { StatusDurationSelectProps } from './components/StatusDurationSelect'

export { StatusDurationUnitSelect } from './components/StatusDurationUnitSelect'
export type { StatusDurationUnitSelectProps } from './components/StatusDurationUnitSelect'

export { StatusDurationValueField } from './components/StatusDurationValueField'
export type { StatusDurationValueFieldProps } from './components/StatusDurationValueField'

// Hooks
export { useCreateAgentStatus } from './hooks/useCreateAgentStatus'
export { useUpdateAgentStatus } from './hooks/useUpdateAgentStatus'

export {
    AgentStatusLegacyBridgeProvider,
    useAgentStatusLegacyBridge,
} from './utils/LegacyBridge'
export { NotificationStatus } from './utils/LegacyBridge/context'
