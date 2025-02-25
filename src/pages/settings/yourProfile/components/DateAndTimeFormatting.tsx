import React from 'react'

import {
    DateFormattingSetting,
    TimeFormattingSetting,
} from 'models/agents/types'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'

import css from './DateAndTimeFormatting.less'

type Props = {
    dateFormat: string
    timeFormat: string
    onSelectDateFormat: (value: string) => void
    onSelectTimeFormat: (value: string) => void
}

export default function DateAndTimeFormatting({
    dateFormat,
    timeFormat,
    onSelectDateFormat,
    onSelectTimeFormat,
}: Props) {
    return (
        <div className={css.dateAndTimeFormattingSettingsWrapper}>
            <RadioFieldSet
                label="Date format"
                onChange={onSelectDateFormat}
                options={Object.entries(DateFormattingSetting).map(
                    ([key, value]) => ({
                        label: value.label,
                        value: key,
                        caption: value.caption,
                    }),
                )}
                selectedValue={dateFormat}
                className={css.settingWrapper}
            />
            <RadioFieldSet
                label="Time format"
                onChange={onSelectTimeFormat}
                options={TimeFormattingSetting.map((value) => ({
                    label: value,
                    value: value,
                }))}
                selectedValue={timeFormat}
                className={css.settingWrapper}
            />
        </div>
    )
}
