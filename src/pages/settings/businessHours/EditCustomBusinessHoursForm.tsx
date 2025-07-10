import { noop } from 'lodash'

import SectionHeader from 'pages/common/components/SectionHeader/SectionHeader'
import TimeScheduleField from 'pages/common/components/TimeScheduleField/TimeScheduleField'

import CreateCustomBusinessHoursForm from './CreateCustomBusinessHoursForm'
import CustomBusinessHoursGeneralFields from './CustomBusinessHoursGeneralFields'
import EditCustomBusinessHoursActions from './EditCustomBusinessHoursActions'
import FormSectionCard from './FormSectionCard'

import css from './EditCustomBusinessHoursForm.less'

export default function EditCustomBusinessHoursForm() {
    return (
        <CreateCustomBusinessHoursForm onSubmit={noop}>
            <div className={css.formContent}>
                <FormSectionCard>
                    <SectionHeader
                        title="General"
                        description="Edit the title and the timezone for your custom business hours."
                    />
                    <CustomBusinessHoursGeneralFields horizontal />
                </FormSectionCard>
                <FormSectionCard>
                    <SectionHeader
                        title="Schedule"
                        description="Add one or multiple time ranges to create your custom schedule."
                    />
                    <TimeScheduleField name="business_hours_config.business_hours" />
                </FormSectionCard>
                <FormSectionCard>
                    <SectionHeader
                        title="Integrations"
                        description="Remove or assign one or multiple integrations for your custom business hours."
                    />
                </FormSectionCard>
                <EditCustomBusinessHoursActions />
            </div>
        </CreateCustomBusinessHoursForm>
    )
}
