import { useEffect } from 'react'

import { useHistory } from 'react-router-dom'

import { useLastSelectedStore } from 'AIJourney/hooks'
import useAppSelector from 'hooks/useAppSelector'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

type RedirectToShopProps = {
    basePath: string
}

export function RedirectToShop({ basePath }: RedirectToShopProps) {
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)
    const { resolveStore } = useLastSelectedStore()
    const history = useHistory()

    useEffect(() => {
        const sortedStoreNames = [...storeIntegrations]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((store) => store.name)

        const resolvedStore = resolveStore(sortedStoreNames)
        if (!resolvedStore) {
            return
        }

        history.replace(`${basePath}/${resolvedStore}`)
    }, [storeIntegrations, history, resolveStore, basePath])

    return null
}
