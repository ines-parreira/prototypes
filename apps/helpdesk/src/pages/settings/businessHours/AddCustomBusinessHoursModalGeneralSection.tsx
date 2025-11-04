import { LegacyLabel as Label } from '@gorgias/axiom'

import TimeScheduleField from 'pages/common/components/TimeScheduleField/TimeScheduleField'

import CustomBusinessHoursGeneralFields from './CustomBusinessHoursGeneralFields'

import css from './AddCustomBusinessHoursModalGeneralSection.less'

export default function AddCustomBusinessHoursModalGeneralSection() {
    return (
        <div className={css.container}>
            <CustomBusinessHoursGeneralFields />
            <div className={css.schedule}>
                <Label isRequired>Schedule</Label>
                <TimeScheduleField name="business_hours_config.business_hours" />
            </div>
        </div>
    )
}
