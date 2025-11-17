import type { CustomFieldValue } from 'custom-fields/types'

type TreeNode = {
    value: CustomFieldValue | null
    children: ChoicesTree
}

export type ChoicesTree = Map<string, TreeNode>

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
