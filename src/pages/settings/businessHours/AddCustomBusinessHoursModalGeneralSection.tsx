import { Label, SelectField } from '@gorgias/merchant-ui-kit'

import { FormField } from 'core/forms'
import TimeScheduleField from 'pages/common/components/TimeScheduleField/TimeScheduleField'
import { getMomentTimezoneNames } from 'utils/date'

import css from './AddCustomBusinessHoursModalGeneralSection.less'

export default function AddCustomBusinessHoursModalGeneralSection() {
    return (
        <div className={css.container}>
            <div className={css.column}>
                <FormField
                    name="business_hours_config.name"
                    label="Name"
                    isRequired
                />
                <div>
                    <FormField
                        name="business_hours_config.timezone"
                        label="Timezone"
                        field={SelectField}
                        options={getMomentTimezoneNames()}
                        isRequired
                    />
                </div>
            </div>
            <div className={css.schedule}>
                <Label isRequired>Schedule</Label>
                <TimeScheduleField name="business_hours_config.business_hours" />
            </div>
        </div>
    )
}
