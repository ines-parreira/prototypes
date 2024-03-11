import {Integration} from 'models/integration/types'

export const getReconnectUrl = (
    connectUrl: string,
    domain: string,
    integration: Integration
) => {
    const reconnectUrl = new URL(connectUrl)
    reconnectUrl.searchParams.set('account', domain)
    reconnectUrl.searchParams.set('integration_id', String(integration.id))
    return reconnectUrl.toString()
}
