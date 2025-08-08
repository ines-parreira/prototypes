import { List } from 'immutable'

import { TicketPriority } from '@gorgias/helpdesk-types'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'

import Select from './ReactSelect'

type Props = {
    onChange: (value: TicketPriority) => void
    value?: string
    className?: string
}

function PrioritySelect({ onChange, value, className }: Props) {
    const schemas = useAppSelector((state) => state.schemas)
    const hasTicketPriorityEnabled = useFlag(
        FeatureFlagKey.TicketAllowPriorityUsage,
        false,
    )

    if (!hasTicketPriorityEnabled) {
        return null
    }

    const options = (
        schemas.getIn([
            'definitions',
            'Ticket',
            'properties',
            'priority',
            'meta',
            'enum',
        ]) as List<any>
    ).toJS()

    return (
        <Select
            className={className}
            value={value}
            onChange={onChange}
            options={options}
        />
    )
}

export default PrioritySelect
