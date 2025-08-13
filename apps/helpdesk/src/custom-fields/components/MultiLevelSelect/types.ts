import { CustomFieldValue } from 'custom-fields/types'

export type ChoicesTree = Map<
    string,
    { value: CustomFieldValue; children: ChoicesTree }
>

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
