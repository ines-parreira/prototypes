import React from 'react'

import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/input/InputField'

import {DAYS_OPTIONS} from 'pages/convert/campaigns/components/CampaignCustomSchedule/contants'
import {CustomSchedule} from 'pages/convert/campaigns/components/CampaignCustomSchedule/types'

import css from './CustomScheduleForm.less'

type Props = {
    schedule: CustomSchedule
    onChange: (data: CustomSchedule) => void
}

const CustomScheduleForm: React.FC<Props> = ({schedule, onChange}) => {
    const handleOnChange = (updatedValue: Partial<CustomSchedule>) => {
        onChange({...schedule, ...updatedValue})
    }

    return (
        <div className={css.customScheduleLine}>
            <SelectField
                value={schedule.days}
                onChange={(value) => handleOnChange({days: value as string})}
                options={DAYS_OPTIONS}
                fixedWidth
            />
            <InputField
                onChange={(e) => handleOnChange({from_time: e})}
                value={schedule.from_time}
                type="time"
                pattern="[0-9][0-9]:[0-9][0-9]"
                name="fromTime"
            />
            <div className={css.toWrapper}>
                <strong>To</strong>
            </div>
            <InputField
                onChange={(e) => handleOnChange({to_time: e})}
                value={schedule.to_time}
                type="time"
                pattern="[0-9][0-9]:[0-9][0-9]"
                name="toTime"
            />
        </div>
    )
}

export default CustomScheduleForm
