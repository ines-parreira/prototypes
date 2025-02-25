import React from 'react'

import classNames from 'classnames'
import { Map } from 'immutable'
import { Input } from 'reactstrap'

import { THEME_NAME, useTheme } from 'core/theme'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { SelectableOption } from 'pages/common/forms/SelectField/types'

import { DAYS_OPTIONS } from './constants'

import css from './BusinessHours.less'

type Props = {
    businessHour: Map<any, any>
    onChange: (map: Map<any, any>) => void
}

const BusinessHoursForm = ({ businessHour, onChange }: Props) => {
    const theme = useTheme()
    const handleOnChange = (newData: Record<string, unknown>) => {
        onChange(businessHour.merge(newData))
    }

    return (
        <div className={css.businessHoursInput}>
            <SelectField
                value={businessHour.get('days')}
                onChange={(value) => handleOnChange({ days: value })}
                options={DAYS_OPTIONS as SelectableOption[]}
                fixedWidth
            />
            <Input
                className={classNames(css.timeField, {
                    [css.dark]: theme.resolvedName === THEME_NAME.Dark,
                })}
                onChange={(e) => handleOnChange({ from_time: e.target.value })}
                value={businessHour.get('from_time')}
                type="time"
                pattern="[0-9][0-9]:[0-9][0-9]"
                name="fromTime"
            />
            <p>to</p>
            <Input
                className={classNames(css.timeField, {
                    [css.dark]: theme.resolvedName === THEME_NAME.Dark,
                })}
                onChange={(e) => handleOnChange({ to_time: e.target.value })}
                value={businessHour.get('to_time')}
                type="time"
                pattern="[0-9][0-9]:[0-9][0-9]"
                name="toTime"
            />
        </div>
    )
}

export default BusinessHoursForm
