import { Integration } from 'models/integration/types'

import { isContactFormChannel, isHelpCenterChannel } from './isIntegration'

export default function deriveLabelFromIntegration(integration: Integration) {
    if (isHelpCenterChannel(integration) || isContactFormChannel(integration)) {
        return integration.name
    }

    return (
        'address' in integration.meta
            ? integration.meta.address
            : integration.name
    ) as string
}
