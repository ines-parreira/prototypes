import React, { useEffect } from 'react'

import { QA_SCORE_DIMENSIONS } from 'pages/common/components/ViewTable/Filters/utils'
import SelectField from 'pages/common/forms/SelectField/SelectField'

type QAScoreSelectProps = {
    onChange: (qaScoreDimension: string) => void
    value: string | null
}

export default function QAScoreSelect({ onChange, value }: QAScoreSelectProps) {
    useEffect(() => {
        if (!value) {
            onChange(QA_SCORE_DIMENSIONS[0].value)
        }
    }, [value, onChange])

    return (
        <SelectField
            value={value}
            onChange={(val) => onChange(val as string)}
            options={QA_SCORE_DIMENSIONS}
        />
    )
}
