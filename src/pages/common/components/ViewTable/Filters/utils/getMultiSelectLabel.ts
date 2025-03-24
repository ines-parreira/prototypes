import { getShortValueLabel } from 'custom-fields/helpers/getValueLabels'
import { CustomFieldValue } from 'custom-fields/types'

export default function getMultiSelectLabel(values?: CustomFieldValue[]) {
    return values?.length
        ? values.length >= 2
            ? `${values.length} fields selected`
            : values.map(getShortValueLabel).join(', ')
        : ''
}
