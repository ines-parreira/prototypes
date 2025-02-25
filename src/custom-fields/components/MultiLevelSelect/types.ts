import { CustomFieldValue } from 'custom-fields/types'

import { CHOICE_VALUES_SYMBOL } from './constants'

// CHOICE_VALUES_SYMBOL prevents an admin to accidentally override the key of leaf values
// While the use of a Set removes duplicate end values
export type ChoicesTree = {
    [key: string]: ChoicesTree
    [CHOICE_VALUES_SYMBOL]: Set<CustomFieldValue>
}

export type SearchResults = {
    label: string
    path: string
    value: CustomFieldValue
}[]

export type CustomInputProps = {
    id: string
    value: string
    placeholder: string
    isDisabled: boolean
    isOpen: boolean
    onFocus: () => void
    ref: (element: HTMLElement | null) => void
}
