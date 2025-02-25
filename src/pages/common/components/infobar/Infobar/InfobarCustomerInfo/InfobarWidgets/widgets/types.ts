import { ComponentType, ReactNode } from 'react'

import type { ButtonProps } from 'pages/common/components/button/Button'

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
    options?: Record<string, string>[]
    allowCustomValue?: boolean
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
    leadingIcon?: ButtonProps['leadingIcon']
}

export type InfobarModalProps = {
    isOpen: boolean
    onChange: (
        name: string,
        value: string | number | boolean | Record<string, unknown>,
        callback?: () => void,
    ) => void
    onBulkChange: (
        options: Array<{
            name: string
            value: string | number | boolean | Record<string, unknown>
        }>,
        callback?: () => void,
    ) => void
    onSubmit: () => void
    onClose: () => void
    data: any
} & Pick<InfobarAction, 'title'>
