import {useState} from 'react'

export const oldSortOrderOptions = [
    {value: 'created_datetime:asc', label: 'Oldest'},
    {value: 'created_datetime:desc', label: 'Newest'},
] as const

export const sortOrderOptions = [
    {
        value: 'last_message_datetime:asc',
        label: '↑ Last message',
    },
    {
        value: 'last_message_datetime:desc',
        label: '↓ Last message',
    },
    {
        value: 'last_received_message_datetime:asc',
        label: '↑ Last received message',
    },
    {
        value: 'last_received_message_datetime:desc',
        label: '↓ Last received message',
    },
    {
        value: 'created_datetime:asc',
        label: '↑ Created',
    },
    {
        value: 'created_datetime:desc',
        label: '↓ Created',
    },
] as const

export type SortOrder = typeof sortOrderOptions[number]['value']

export default function useSortOrder() {
    return useState<SortOrder>('created_datetime:desc')
}
