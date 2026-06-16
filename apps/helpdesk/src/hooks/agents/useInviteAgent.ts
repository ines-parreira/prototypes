import { toast } from '@gorgias/axiom'

import { useInviteAgent as usePureInviteAgent } from 'models/agents/queries'

import { handleError } from './errorHandler'

export const useInviteAgent = (email: string) => {
    return usePureInviteAgent({
        onSuccess: () => {
            toast.success(`Invite has been sent to ${email}`)
        },
        onError: (error) => handleError(error, 'Failed to send invite'),
    })
}
