import { Tag } from '@gorgias/axiom'

import { DROPDOWN_NESTING_DELIMITER } from 'custom-fields/constants'
import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'

interface Props {
    outcome: string
}

export const OutcomeTag = ({ outcome }: Props) => {
    const label = outcome.split(DROPDOWN_NESTING_DELIMITER)[0]
    const color =
        label === AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated
            ? 'green'
            : label === AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover
              ? 'orange'
              : 'blue'

    return <Tag color={color}>{label}</Tag>
}
