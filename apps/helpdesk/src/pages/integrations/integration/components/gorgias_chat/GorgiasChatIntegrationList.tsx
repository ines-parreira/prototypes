import type { ComponentProps } from 'react'

import GorgiasChatIntegrationListLegacy from './legacy/GorgiasChatIntegrationList/GorgiasChatIntegrationList'

type Props = ComponentProps<typeof GorgiasChatIntegrationListLegacy>

export const GorgiasChatIntegrationList = (props: Props) => {
    return <GorgiasChatIntegrationListLegacy {...props} />
}
