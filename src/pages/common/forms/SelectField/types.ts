import type {ReactNode} from 'react'

export type Value = number | string

export type Option = {
    value: Value
    text?: string // text used to filter with the search value
    label?: ReactNode | string // text displayed in the dropdown
}
