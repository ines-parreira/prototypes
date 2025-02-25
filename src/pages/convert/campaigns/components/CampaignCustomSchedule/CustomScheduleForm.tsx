import React from 'react'

import IconInput from 'pages/common/forms/input/IconInput'
import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { CustomScheduleSchema } from 'pages/convert/campaigns/types/CampaignSchedule'

import css from './CustomScheduleForm.less'

type Props = {
    options: { label: string; value: string }[]
    schedule: CustomScheduleSchema
    onChange: (data: CustomScheduleSchema) => void
}

const CustomScheduleForm: React.FC<Props> = ({
    schedule,
    options,
    onChange,
}) => {
    const handleOnChange = (updatedValue: Partial<CustomScheduleSchema>) => {
        onChange({ ...schedule, ...updatedValue })
    }

    return (
        <div className={css.customScheduleLine}>
            <SelectField
                value={schedule.days}
                onChange={(value) => handleOnChange({ days: value as string })}
                options={options}
                fixedWidth
            />
            <InputField
                className={css.timeInput}
                onChange={(e) => handleOnChange({ from_time: e })}
                value={schedule.from_time}
                type="time"
                pattern="[0-9][0-9]:[0-9][0-9]"
                name="fromTime"
                prefix={<IconInput className={css.icon} icon="schedule" />}
            />
            <div className={css.toWrapper}>
                <strong>To</strong>
            </div>
            <InputField
                className={css.timeInput}
                onChange={(e) => handleOnChange({ to_time: e })}
                value={schedule.to_time}
                type="time"
                pattern="[0-9][0-9]:[0-9][0-9]"
                name="toTime"
                prefix={<IconInput className={css.icon} icon="schedule" />}
            />
        </div>
    )
}

export default CustomScheduleForm
