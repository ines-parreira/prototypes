import { FormField } from '@repo/forms'
import classNames from 'classnames'

import InputField from 'pages/common/forms/input/InputField'
import SelectDropdownField from 'pages/common/forms/SelectDropdownField'
import { getMomentTimezoneNames } from 'utils/date'

import css from './CustomBusinessHoursGeneralFields.less'

type Props = {
    horizontal?: boolean
}

export default function CustomBusinessHoursGeneralFields({
    horizontal = false,
}: Props) {
    return (
        <div
            className={classNames(css.container, { [css.column]: !horizontal })}
        >
            <FormField
                field={InputField}
                className={css.field}
                name="name"
                label="Name"
                isRequired
            />
            <div className={css.field}>
                <FormField
                    name="business_hours_config.timezone"
                    label="Timezone"
                    field={SelectDropdownField}
                    options={getMomentTimezoneNames()}
                    isRequired
                />
            </div>
        </div>
    )
}
