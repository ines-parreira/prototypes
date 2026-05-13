import { isAxiosError } from 'axios'

import { toast } from '@gorgias/axiom'

export function handleError(error: unknown, defaultMsg: string) {
    if (isAxiosError(error)) {
        if (error.response?.status === 409) {
            toast.error(
                'An Action with this name already exists. Choose a unique name in order to save.',
            )
            return undefined
        }

        const message = (
            error?.response?.data as { message: string } | undefined
        )?.message
        if (message) {
            toast.error(message)
            return undefined
        }
    }
    toast.error(defaultMsg)
}
