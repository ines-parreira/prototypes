import type { ReactNode } from 'react'

import type { SegmentedOptionValue } from './SegmentedOptionValue'

export type SegmentedOptionModel = {
    disabled?: boolean
    label: ReactNode
    value: SegmentedOptionValue
}
