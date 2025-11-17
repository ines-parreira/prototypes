import { LegacyCheckBoxField as CheckBoxField } from '@gorgias/axiom'

import { getValueLabel } from 'custom-fields/helpers/getValueLabels'
import type {
    CustomFieldPrediction,
    CustomFieldValue,
} from 'custom-fields/types'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import CheckIcon from './CheckIcon'
import { isMultiValueAllowed } from './helpers/isMultiValue'

import css from './MultiLevelSelect.less'

type LeafLevelOptionProps = {
    className?: string
    choice: CustomFieldValue
    value?: CustomFieldValue | CustomFieldValue[]
    fullValue: CustomFieldValue
    onClick: () => void
    prediction?: CustomFieldPrediction
    isPredictionCorrect: boolean
    allowMultiValues: boolean
    showCheckboxes: boolean
}

export function LeafLevelOption({
    className,
    choice,
    value,
    fullValue,
    onClick,
    prediction,
    isPredictionCorrect,
    allowMultiValues,
    showCheckboxes,
}: LeafLevelOptionProps) {
    const label = getValueLabel(choice)
    return (
        <DropdownItem
            className={className}
            tag="button"
            onClick={onClick}
            option={{ label, value: choice }}
        >
            {fullValue === prediction?.predicted && isPredictionCorrect && (
                <i className={`material-icons mr-2 ${css.predictionIcon}`}>
                    auto_awesome
                </i>
            )}
            <span className={css.choiceButton}>
                <span className={css.ellipsis}>{label}</span>
            </span>
            {showCheckboxes ? (
                <span className={css.checkbox}>
                    <CheckBoxField
                        value={
                            isMultiValueAllowed(allowMultiValues, value)
                                ? value.includes(fullValue)
                                : fullValue === value
                        }
                        onChange={() => {}}
                        onClick={() => {}}
                    />
                </span>
            ) : (
                (isMultiValueAllowed(allowMultiValues, value)
                    ? value?.includes(fullValue)
                    : fullValue === value) && <CheckIcon />
            )}
        </DropdownItem>
    )
}
