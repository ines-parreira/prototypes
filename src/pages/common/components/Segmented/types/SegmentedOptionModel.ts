import {ReactNode} from 'react'

import {SegmentedOptionValue} from './SegmentedOptionValue'

export type SegmentedOptionModel = {
    disabled?: boolean
    label: ReactNode
    value: SegmentedOptionValue
}
