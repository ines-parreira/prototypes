import classNames from 'classnames'

import { SelectField } from '@gorgias/merchant-ui-kit'

import { FormField } from 'core/forms'
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
                className={css.field}
                name="business_hours_config.name"
                label="Name"
                isRequired
            />
            <div className={css.field}>
                <FormField
                    name="business_hours_config.timezone"
                    label="Timezone"
                    field={SelectField}
                    options={getMomentTimezoneNames()}
                    isRequired
                />
            </div>
        </div>
    )
}
