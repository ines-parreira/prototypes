import { getValueLabel } from 'custom-fields/helpers/getValueLabels'
import { CustomFieldValue } from 'custom-fields/types'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import css from './MultiLevelSelect.less'

type LevelOptionProps = {
    className?: string
    key: string
    choice: CustomFieldValue
    onClick: () => void
}

export function LevelOption({
    className,
    key,
    choice,
    onClick,
}: LevelOptionProps) {
    const label = getValueLabel(choice)
    return (
        <DropdownItem
            className={className}
            key={key}
            tag="button"
            onClick={onClick}
            option={{ label, value: choice }}
        >
            <span className={css.choiceButton}>
                <span className={css.ellipsis}>{label}</span>
                <span className={`material-icons ${css.nextIcon}`}>
                    navigate_next
                </span>
            </span>
        </DropdownItem>
    )
}
