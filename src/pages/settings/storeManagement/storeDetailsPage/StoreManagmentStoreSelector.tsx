import { useHistory, useLocation, useParams } from 'react-router-dom'

import StoreSelector from 'pages/common/components/StoreSelector/StoreSelector'

import { useStoreManagementState } from '../StoreManagementProvider'

export default function StoreManagementStoreSelector() {
    const { stores } = useStoreManagementState()
    const { id } = useParams<{ id: string }>()
    const history = useHistory()
    const location = useLocation()

    const integrations = stores.map((store) => store.store)
    const selected = integrations.find(
        (integration) => integration.id === Number(id),
    )

    const onChange = (selectedStore: number) => {
        const currentPath = location.pathname
        // preserve sub-routes ( /settings or /channels)
        const newPath = currentPath.replace(/\/\d+/, `/${selectedStore}`)
        history.replace(newPath)
    }

    return (
        <StoreSelector
            integrations={integrations}
            selected={selected}
            onChange={onChange}
            withSearch
        />
    )
}
