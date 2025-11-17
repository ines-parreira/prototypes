import { splitDropdownValue } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/helpers/dropdown'
import { DROPDOWN_VALUES_LIMIT } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/constants'
import type { Parameter } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import { hasUnicodeChars } from 'utils'

export function validateHeaderName(value: string, path: string) {
    if (path.includes('headers') && hasUnicodeChars(value)) {
        return "Header's name can't contain unicode characters."
    }
}

export function checkDuplicates(params: Parameter[]): boolean {
    return params.some((paramA, indexA) =>
        params.some(
            (paramB, indexB) =>
                paramA.key && indexA !== indexB && paramA.key === paramB.key,
        ),
    )
}

export function validateDropdownValues(input?: string) {
    if (!input) return
    const values = splitDropdownValue(input)
    if (values.length > DROPDOWN_VALUES_LIMIT) {
        return `Limit reached: only ${DROPDOWN_VALUES_LIMIT} first values will be saved.`
    }
}
