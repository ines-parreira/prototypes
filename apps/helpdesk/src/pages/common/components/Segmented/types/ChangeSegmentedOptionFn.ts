import type { ChangeEvent } from 'react'

import type { SegmentedOptionValue } from './SegmentedOptionValue'

export type ChangeSegmentedOptionFn = (
    event: ChangeEvent<HTMLInputElement>,
    value: SegmentedOptionValue,
) => void
