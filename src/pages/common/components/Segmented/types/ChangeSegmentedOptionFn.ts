import {ChangeEvent} from 'react'

import {SegmentedOptionValue} from './SegmentedOptionValue'

export type ChangeSegmentedOptionFn = (
    event: ChangeEvent<HTMLInputElement>,
    value: SegmentedOptionValue
) => void
