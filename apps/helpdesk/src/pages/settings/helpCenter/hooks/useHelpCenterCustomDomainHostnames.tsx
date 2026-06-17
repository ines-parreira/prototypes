import { useCallback, useEffect, useState } from 'react'

import { toast } from '@gorgias/axiom'

import { useHelpCenterApi } from './useHelpCenterApi'

const useHelpCenterCustomDomainHostnames = (helpCenterId?: number) => {
    const { client } = useHelpCenterApi()
    const [customDomainHostnames, setCustomDomainHostnames] = useState<
        string[]
    >([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchCustomDomains = useCallback(async () => {
        if (!client || !helpCenterId) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        try {
            const {
                data: { data: customDomains },
            } = await client.listCustomDomains({
                help_center_id: helpCenterId,
            })
            const activeCustomDomains = customDomains.filter(
                (domain) => domain.status === 'active',
            )
            setCustomDomainHostnames(
                activeCustomDomains.map((domain) => domain.hostname),
            )
        } catch {
            toast.error("Failed to fetch Help Center's custom domains")
        } finally {
            setIsLoading(false)
        }
    }, [client, helpCenterId])

    useEffect(() => {
        void fetchCustomDomains()
    }, [fetchCustomDomains])

    return { customDomainHostnames, isLoading }
}

export { useHelpCenterCustomDomainHostnames }
