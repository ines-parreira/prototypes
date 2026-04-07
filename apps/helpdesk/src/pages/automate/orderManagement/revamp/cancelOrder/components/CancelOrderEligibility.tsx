import _isEqual from 'lodash/isEqual'

import { Box, ListItem, SelectField, Text, TextVariant } from '@gorgias/axiom'

import { CancellationsDropdownOptionsList } from 'models/selfServiceConfiguration/constants'
import type { SelfServiceConfigurationFilter } from 'models/selfServiceConfiguration/types'

import css from './CancelOrderEligibility.less'

type SelectOption = {
    value: string
    label: string
    statuses: string[]
}

type Props = {
    eligibility?: SelfServiceConfigurationFilter
    onChange: (value: string[] | undefined) => void
}

export const CancelOrderEligibility = ({ eligibility, onChange }: Props) => {
    const selectedOption = CancellationsDropdownOptionsList.find((option) =>
        _isEqual(option.statuses, eligibility?.value),
    )

    const handleChange = (option: SelectOption | null) => {
        onChange(option?.statuses)
    }

    return (
        <Box flexDirection="column" gap="xs">
            <Box flexDirection="column" gap="xxxs">
                <Text size="md" variant={TextVariant.Medium}>
                    Eligibility window
                </Text>
                <Text size="sm" color="content-neutral-secondary">
                    Customers can request a cancellation when an order meets the
                    following criteria:
                </Text>
            </Box>
            <Box alignItems="center" gap="xs">
                <div className={css.staticLabel}>
                    <Text size="md">Order status is</Text>
                </div>
                <Box className={css.selectField}>
                    <SelectField<SelectOption>
                        items={CancellationsDropdownOptionsList}
                        value={selectedOption}
                        onChange={handleChange}
                        keyName="value"
                        placeholder="Select status"
                        aria-label="Order status selector"
                    >
                        {(option: SelectOption) => (
                            <ListItem id={option.value} label={option.label} />
                        )}
                    </SelectField>
                </Box>
            </Box>
        </Box>
    )
}
