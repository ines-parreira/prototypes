import type { CreateCustomUserAvailabilityStatus } from '@gorgias/helpdesk-queries'

export type CreateAgentStatusModalProps = {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    onSubmit: (data: CreateCustomUserAvailabilityStatus) => void
    isLoading?: boolean
}
