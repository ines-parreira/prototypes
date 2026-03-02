import type { ComponentProps } from 'react'

import { GorgiasAutomateChatIntegration as GorgiasAutomateChatIntegrationLegacy } from './legacy/GorgiasAutomateChatIntegration'

type Props = ComponentProps<typeof GorgiasAutomateChatIntegrationLegacy>

export function GorgiasAutomateChatIntegration(props: Props) {
    return <GorgiasAutomateChatIntegrationLegacy {...props} />
}
