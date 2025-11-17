import type { ReactNode } from 'react'

export type Option = {
    label: string
    isDeprecated?: boolean
    displayLabel?: ReactNode
    value: any
}
