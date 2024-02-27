import React, {useMemo} from 'react'
import {Redirect} from 'react-router-dom'
import {useGetSortedIntegrations} from '../../hooks/useGetSortedIntegrations'

const ConvertRoute = () => {
    const sortedIntegrations = useGetSortedIntegrations()

    const url = useMemo(() => {
        if (sortedIntegrations.length === 0) {
            // TODO: link here onboarding setup flow for accounts without integrations
            return '/app'
        }

        // TODO: change to campaigns when page exists
        return `/app/convert/${sortedIntegrations[0].id}/installation`
    }, [sortedIntegrations])

    return <Redirect to={url} />
}
export default ConvertRoute
