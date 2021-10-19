import {ComponentType, ReactNode} from 'react'

export type Parameter = {
    name: string
    type: string
    label?: string
    defaultValue?: string | number | boolean | null
    placeholder?: string
    required?: boolean
    step?: number
    min?: number
    max?: number
}

export type Option = {
    value: string
    label?: string
    parameters?: Parameter[]
}

export type InfobarAction = {
    key: string
    options: Array<Option>
    title: ReactNode
    child: JSX.Element
    popover?: string
    tooltip?: string
    modal?: ComponentType<InfobarModalProps>
    modalData?: Record<string, unknown>
}

export type InfobarModalProps = {
    header: ReactNode
    isOpen: boolean
    onChange: (
        name: string,
        value: string | number | boolean | Record<string, unknown>,
        callback?: () => void
    ) => void
    onBulkChange: (
        options: Array<{
            name: string
            value: string | number | boolean | Record<string, unknown>
        }>,
        callback?: () => void
    ) => void
    onSubmit: () => void
    onClose: () => void
    data: any
}
