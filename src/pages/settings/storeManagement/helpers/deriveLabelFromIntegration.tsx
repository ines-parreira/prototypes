import { Integration } from 'models/integration/types'

export default function deriveLabelFromIntegration(integration: Integration) {
    return (
        'address' in integration.meta
            ? integration.meta.address
            : integration.name
    ) as string
}
