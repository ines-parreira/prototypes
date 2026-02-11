import isEmpty from 'lodash/isEmpty'
import isObject from 'lodash/isObject'
import omit from 'lodash/omit'
import JSONPretty from 'react-json-pretty'

import { Box, RadioCard, RadioGroup } from '@gorgias/axiom'

import { CustomerSelection } from '../hooks/useMergeCustomersState'
import type { CustomerSelectionValue } from '../hooks/useMergeCustomersState'

import css from '../MergeCustomersModal.less'

type CustomerMetaFieldProps = {
    destinationData: Record<string, unknown>
    sourceData: Record<string, unknown>
    selectedValue: CustomerSelectionValue
    onChange: (value: CustomerSelectionValue) => void
    isDisabled?: boolean
}

function filterShopifyData(
    data: Record<string, unknown>,
): Record<string, unknown> {
    if (!data || !isObject(data)) {
        return data
    }

    return omit(data, '_shopify')
}

function hasData(data: Record<string, unknown>): boolean {
    const filteredData = filterShopifyData(data)
    return !isEmpty(filteredData)
}

export function CustomerMetaField({
    destinationData,
    sourceData,
    selectedValue,
    onChange,
    isDisabled = false,
}: CustomerMetaFieldProps) {
    const getSelectedValue = () => {
        return isDisabled ? '' : selectedValue
    }

    const handleChange = (value: string) => {
        onChange(value as CustomerSelectionValue)
    }

    const getDataContent = (data: Record<string, unknown>) => {
        if (!hasData(data)) {
            return <JSONPretty data={{}} className={css.jsonPretty} />
        }

        const filtered = filterShopifyData(data)
        return (
            <Box flexDirection="column" gap="xxxs">
                <JSONPretty data={filtered} className={css.jsonPretty} />
            </Box>
        )
    }

    return (
        <RadioGroup
            value={getSelectedValue()}
            onChange={handleChange}
            isDisabled={isDisabled}
            className={css.radioGroup}
        >
            <RadioCard
                value={CustomerSelection.Destination}
                title="Customer data"
                isDisabled={!hasData(destinationData)}
            >
                {getDataContent(destinationData)}
            </RadioCard>
            <RadioCard
                value={CustomerSelection.Source}
                title="Customer data"
                isDisabled={!hasData(sourceData)}
            >
                {getDataContent(sourceData)}
            </RadioCard>
        </RadioGroup>
    )
}
