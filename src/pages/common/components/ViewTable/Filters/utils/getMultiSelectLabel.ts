import { getStealthLabel } from 'custom-fields/components/MultiLevelSelect/helpers/getLabels'
import { CustomFieldValue } from 'custom-fields/types'

export default function getMultiSelectLabel(values?: CustomFieldValue[]) {
    return values?.length
        ? values.length >= 2
            ? `${values.length} fields selected`
            : values.map(getStealthLabel).join(', ')
        : ''
}
