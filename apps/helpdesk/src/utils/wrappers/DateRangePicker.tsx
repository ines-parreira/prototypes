import type { ReactNode } from 'react'
import { forwardRef } from 'react'

import type { EventHandler, Props } from 'react-bootstrap-daterangepicker'
import BaseDateRangePicker from 'react-bootstrap-daterangepicker'

export type DateRangePickerProps = Props & {
    children?: ReactNode
}

export const DateRangePicker = forwardRef<
    BaseDateRangePicker,
    DateRangePickerProps
>(({ children, ...props }, ref) => {
    return (
        // @ts-expect-error
        <BaseDateRangePicker ref={ref} {...props}>
            {children}
        </BaseDateRangePicker>
    )
})

export type { Props, EventHandler, BaseDateRangePicker }
