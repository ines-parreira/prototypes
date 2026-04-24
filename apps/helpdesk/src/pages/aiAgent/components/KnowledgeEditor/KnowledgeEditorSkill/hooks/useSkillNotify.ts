import { useMemo } from 'react'

import { toast } from '@gorgias/axiom'

export const useSkillNotify = () => {
    return useMemo(() => {
        const success = (message: string, caption?: string) =>
            toast.success(message, { caption })

        const error = (message: string) => toast.error(message)

        return { success, error }
    }, [])
}
