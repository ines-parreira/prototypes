// @repo/agent-status

export { AgentStatusesTable } from './components'
export { DeleteStatusConfirmationModal } from './components/DeleteStatusModal'
export { UserInfoHeader, UserInfoHeaderContainer } from './components'
export type { UserInfoHeaderProps } from './components/UserInfoHeader'
export { AgentAvailabilityStatusSelect } from './components/AgentAvailabilityStatusSelect'
export type { AgentAvailabilityStatusSelectProps } from './components/AgentAvailabilityStatusSelect'

export {
    DURATION_LIMITS,
    DURATION_OPTIONS,
    DURATION_UNIT_OPTIONS,
    PREDEFINED_SELECTABLE_STATUSES,
    SYSTEM_STATUSES,
    VALIDATION,
} from './constants'

export {
    useUserAvailabilityStatus,
    useAgentStatuses,
    useDeleteCustomUserAvailabilityStatus,
    useCustomUserUnavailabilityModal,
    useSelectableAgentAvailabilityStatuses,
    useAvailabilityStatusColor,
    useCustomAgentUnavailableStatusesFlag,
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

export { useAgentPhoneStatus } from './hooks/useAgentPhoneStatus'
export { useListUserPhoneStatuses } from './hooks/useListUserPhoneStatuses'
export { usePhoneStatusBatchPollingInterval } from './hooks/usePhoneStatusBatchPollingInterval'

export { AVAILABLE_STATUS } from './constants'

export { formatDuration } from './utils'
