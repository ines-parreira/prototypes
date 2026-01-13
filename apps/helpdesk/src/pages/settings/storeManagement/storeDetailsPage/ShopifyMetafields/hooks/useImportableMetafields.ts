import { useParams } from 'react-router-dom'

import { useMetafieldDefinitions } from './useMetafieldDefinitions'

export function useImportableMetafields() {
    const { id } = useParams<{ id: string }>()

    return useMetafieldDefinitions({
        integrationId: Number(id),
        pinned: false,
    })
}
