import type { ComponentProps } from 'react'

import GorgiasChatCreationWizardLegacy from './legacy/GorgiasChatCreationWizard/GorgiasChatCreationWizard'

type Props = ComponentProps<typeof GorgiasChatCreationWizardLegacy>

export const GorgiasChatCreationWizard = (props: Props) => {
    return <GorgiasChatCreationWizardLegacy {...props} />
}
