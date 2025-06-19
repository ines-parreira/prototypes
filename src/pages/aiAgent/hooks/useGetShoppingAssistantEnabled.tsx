import { useMemo } from 'react'

import { useStoreActivations } from '../Activation/hooks/useStoreActivations'

type Props = {
    shopName: string
}

export const useGetShoppingAssistantEnabled = ({ shopName }: Props) => {
    const { storeActivations, isFetchLoading } = useStoreActivations({
        storeName: shopName,
    })

    const isEnabled = useMemo(() => {
        return storeActivations[shopName]?.sales?.enabled ?? false
    }, [storeActivations, shopName])

    return {
        isEnabled,
        isLoading: isFetchLoading || Object.keys(storeActivations).length === 0,
    }
}
