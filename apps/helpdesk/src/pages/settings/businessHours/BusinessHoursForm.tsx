import classNames from 'classnames'
import { Input } from 'reactstrap'

import { THEME_NAME, useTheme } from 'core/theme'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { SelectableOption } from 'pages/common/forms/SelectField/types'
import { BusinessHour } from 'state/currentAccount/types'

import { DEPRECATED_DAYS_OPTIONS } from './constants'

import css from './BusinessHours.less'

type Props = {
    businessHour: BusinessHour
    onChange: (map: BusinessHour) => void
}

const BusinessHoursForm = ({ businessHour, onChange }: Props) => {
    const theme = useTheme()
    const handleOnChange = (newData: Partial<BusinessHour>) => {
        onChange({ ...businessHour, ...newData })
    }

    return (
        <div className={css.businessHoursInput}>
            <SelectField
                value={businessHour.days}
                onChange={(value) => handleOnChange({ days: value.toString() })}
                options={DEPRECATED_DAYS_OPTIONS as SelectableOption[]}
                fixedWidth
            />
            <Input
                className={classNames(css.timeField, {
                    [css.dark]: theme.resolvedName === THEME_NAME.Dark,
                })}
                onChange={(e) => handleOnChange({ from_time: e.target.value })}
                value={businessHour.from_time}
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
                value={businessHour.to_time}
                type="time"
                pattern="[0-9][0-9]:[0-9][0-9]"
                name="toTime"
            />
        </div>
    )
}

export default BusinessHoursForm
