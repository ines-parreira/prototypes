import type { CreateCustomUserAvailabilityStatus } from '@gorgias/helpdesk-queries'

/**
 * Props for the CreateAgentStatusModal component
 */
export type CreateAgentStatusModalProps = {
    /** Whether the modal is open */
    isOpen: boolean
    /** Callback to handle modal open/close state changes */
    onOpenChange: (open: boolean) => void
    /** Optional callback when status is successfully created */
    onCreate?: (data: CreateCustomUserAvailabilityStatus) => Promise<void>
    /** Whether the modal is loading */
    isLoading: boolean
}
