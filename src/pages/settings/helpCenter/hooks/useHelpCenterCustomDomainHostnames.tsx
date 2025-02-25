import {useState, useEffect, useCallback} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {useHelpCenterApi} from './useHelpCenterApi'

const useHelpCenterCustomDomainHostnames = (helpCenterId?: number) => {
    const {client} = useHelpCenterApi()
    const [customDomainHostnames, setCustomDomainHostnames] = useState<
        string[]
    >([])
    const [isLoading, setIsLoading] = useState(true)
    const dispatch = useAppDispatch()

    const fetchCustomDomains = useCallback(async () => {
        if (!client || !helpCenterId) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        try {
            const {
                data: {data: customDomains},
            } = await client.listCustomDomains({
                help_center_id: helpCenterId,
            })
            const activeCustomDomains = customDomains.filter(
                (domain) => domain.status === 'active'
            )
            setCustomDomainHostnames(
                activeCustomDomains.map((domain) => domain.hostname)
            )
        } catch {
            void dispatch(
                notify({
                    message: "Failed to fetch Help Center's custom domains",
                    status: NotificationStatus.Error,
                })
            )
        } finally {
            setIsLoading(false)
        }
    }, [client, helpCenterId, dispatch])

    useEffect(() => {
        void fetchCustomDomains()
    }, [fetchCustomDomains])

    return {customDomainHostnames, isLoading}
}

export default useHelpCenterCustomDomainHostnames
