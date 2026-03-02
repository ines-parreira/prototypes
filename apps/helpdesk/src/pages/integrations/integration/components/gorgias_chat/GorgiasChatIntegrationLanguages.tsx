import type { ComponentProps } from 'react'

import GorgiasChatIntegrationLanguagesLegacy from './legacy/GorgiasChatIntegrationLanguages/GorgiasChatIntegrationLanguages'

type Props = ComponentProps<typeof GorgiasChatIntegrationLanguagesLegacy>

export const GorgiasChatIntegrationLanguages = (props: Props) => {
    return <GorgiasChatIntegrationLanguagesLegacy {...props} />
}
