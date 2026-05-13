import { ToggleField } from '@gorgias/axiom'

type Props = {
    isEnabled: boolean
    onToggle: (enabled: boolean) => void
    label?: string
    description?: string
}

const DEFAULT_DESCRIPTION =
    'Require customer to confirm before this action runs. Recommended for irreversible actions.'

export const ConfirmationToggle = ({
    isEnabled,
    onToggle,
    label = 'Customer confirmation',
    description = DEFAULT_DESCRIPTION,
}: Props) => {
    return (
        <ToggleField
            label={label}
            caption={description}
            value={isEnabled}
            onChange={onToggle}
        />
    )
}
