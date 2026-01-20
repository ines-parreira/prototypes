import type { CreateCustomUserAvailabilityStatus } from '@gorgias/helpdesk-queries'

import type { AgentStatusWithSystem } from '../../types'

export type EditAgentStatusModalProps = {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    status: AgentStatusWithSystem
    onSubmit: (
        data: CreateCustomUserAvailabilityStatus,
        status: AgentStatusWithSystem,
    ) => void
    isLoading?: boolean
}
