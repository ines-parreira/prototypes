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
            <FormField name="name" isRequired label="Name">
                {(field) => <InputField {...field} className={css.field} />}
            </FormField>
            <div className={css.field}>
                <FormField
                    name="business_hours_config.timezone"
                    isRequired
                    label="Timezone"
                >
                    {(field) => (
                        <SelectDropdownField
                            {...field}
                            options={getMomentTimezoneNames()}
                        />
                    )}
                </FormField>
            </div>
        </div>
    )
}
