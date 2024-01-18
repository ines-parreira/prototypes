import {useState} from 'react'

export const sortOrderOptions = [
    {value: 'created_datetime:asc', label: 'Oldest'},
    {value: 'created_datetime:desc', label: 'Newest'},
] as const

export type SortOrder = typeof sortOrderOptions[number]['value']

export default function useSortOrder() {
    return useState<SortOrder>(sortOrderOptions[0].value)
}
