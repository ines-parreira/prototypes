import { useMemo } from 'react'

import {
    Button,
    ListItem,
    NumberField,
    SelectField,
    Text,
} from '@gorgias/axiom'

import { ReturnsDropdownOptionsList } from 'models/selfServiceConfiguration/constants'
import type { SelfServiceConfigurationFilter } from 'models/selfServiceConfiguration/types'
import { FilterOperatorEnum } from 'models/selfServiceConfiguration/types'

import css from './ReturnOrderEligibility.less'

type EligibilityOption = {
    value: string
    label: string
}

type Props = {
    eligibility?: SelfServiceConfigurationFilter
    onChange: (eligibility?: SelfServiceConfigurationFilter) => void
}

export const ReturnOrderEligibility = ({ eligibility, onChange }: Props) => {
    const handleKeyChange = (item: EligibilityOption | null) => {
        if (!item) return
        onChange({
            value: '1',
            operator: FilterOperatorEnum.LESS_THAN,
            ...eligibility,
            key: item.value,
        })
    }

    const handleValueChange = (nextValue: number) => {
        onChange({
            ...(eligibility as SelfServiceConfigurationFilter),
            value: nextValue.toString(10),
        })
    }

    const handleDelete = () => {
        onChange()
    }

    const selectedItem = useMemo(
        () =>
            ReturnsDropdownOptionsList.find(
                (option) => option.value === eligibility?.key,
            ),
        [eligibility?.key],
    )

    return (
        <div className={css.container}>
            <Text size="md" variant="medium">
                Eligibility window
            </Text>
            <Text size="sm" className={css.description}>
                Customers can request a return when an order meets the following
                criteria:
            </Text>
            {eligibility ? (
                <div className={css.conditionRow}>
                    <div className={css.conditionSelect}>
                        <SelectField<EligibilityOption>
                            items={ReturnsDropdownOptionsList}
                            value={selectedItem}
                            onChange={handleKeyChange}
                            keyName="value"
                            aria-label="Eligibility condition"
                        >
                            {(option: EligibilityOption) => (
                                <ListItem
                                    id={option.value}
                                    label={option.label}
                                />
                            )}
                        </SelectField>
                    </div>
                    <div className={css.conditionLabel}>less than</div>
                    <div className={css.conditionNumberInput}>
                        <NumberField
                            value={
                                parseInt(eligibility.value as string, 10) || 1
                            }
                            onChange={handleValueChange}
                            minValue={1}
                            aria-label="Days"
                        />
                    </div>
                    <div className={css.conditionLabel}>days ago</div>
                    <Button
                        icon="close"
                        size="sm"
                        variant="tertiary"
                        aria-label="Remove eligibility condition"
                        onClick={handleDelete}
                    />
                </div>
            ) : (
                <div className={css.conditionSelect}>
                    <SelectField<EligibilityOption>
                        items={ReturnsDropdownOptionsList}
                        value={undefined}
                        onChange={handleKeyChange}
                        placeholder="Select condition"
                        keyName="value"
                        aria-label="Eligibility condition"
                    >
                        {(option: EligibilityOption) => (
                            <ListItem id={option.value} label={option.label} />
                        )}
                    </SelectField>
                </div>
            )}
        </div>
    )
}
