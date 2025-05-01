import { Badge } from '@gorgias/merchant-ui-kit'

import { NewToggleButton } from 'pages/common/forms/NewToggleButton'

import css from './EngagementSettingsCard.less'

type EngagementSettingsCardToggleProps = {
    isChecked: boolean
    isDisabled?: boolean
    onChange: (value: boolean) => void
}

export const EngagementSettingsCardToggle = ({
    isChecked,
    isDisabled = false,
    onChange,
}: EngagementSettingsCardToggleProps) => {
    return (
        <div className={css.cardToggle}>
            {!isChecked && <Badge type="light-dark">OFF</Badge>}

            <NewToggleButton
                isDisabled={isDisabled}
                checked={isChecked}
                onChange={onChange}
            />
        </div>
    )
}
