import { useState } from 'react'

import { Label, TextField } from '@gorgias/axiom'

import { TimeFrameSelector } from './TimeFrameSelector'

import css from '../CreateImportModal.less'

type TimeFrameFieldProps = {
    timeframe: string
    setTimeframe: (timeframe: string) => void
    onCancel: () => void
}

export const TimeFrameField = ({
    timeframe,
    setTimeframe,
    onCancel,
}: TimeFrameFieldProps) => {
    const [isTimespanSelectorOpen, setIsTimespanSelectorOpen] = useState(false)

    return (
        <div className={css.formGroup}>
            <Label isRequired>Import timeframe</Label>
            <TextField
                placeholder="Please select a timeframe"
                value={timeframe}
                onClick={() => setIsTimespanSelectorOpen(true)}
            />
            <TimeFrameSelector
                isOpen={isTimespanSelectorOpen}
                onSubmit={(startDate, endDate) => {
                    setIsTimespanSelectorOpen(false)
                    setTimeframe(
                        `${startDate.format('MMM DD, YYYY')} - ${endDate.format('MMM DD, YYYY')}`,
                    )
                }}
                onCancel={() => {
                    setIsTimespanSelectorOpen(false)
                    onCancel()
                }}
            />
        </div>
    )
}
