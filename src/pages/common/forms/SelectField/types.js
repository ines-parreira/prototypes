//@flow
import type {Node} from 'react'

export type Value = number | string

export type Option = {
    value: Value,
    text?: string, // text used to filter with the search value
    label?: Node | string, // text displayed in the dropdown
    isDeprecated?: boolean,
}
