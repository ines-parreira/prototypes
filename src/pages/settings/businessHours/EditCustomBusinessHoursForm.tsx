import { noop, omit } from 'lodash'

import { BusinessHoursDetails } from '@gorgias/helpdesk-types'
import { validateBusinessHoursDetails } from '@gorgias/helpdesk-validators'

import { Form, toFormErrors } from 'core/forms'
import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import TimeScheduleField from 'pages/common/components/TimeScheduleField/TimeScheduleField'

import CustomBusinessHoursGeneralFields from './CustomBusinessHoursGeneralFields'
import EditCustomBusinessHoursActions from './EditCustomBusinessHoursActions'
import EditCustomBusinessHoursIntegrationsSection from './EditCustomBusinessHoursIntegrationsSection'
import { EditCustomBusinessHoursFormValues } from './types'
import { getEditCustomBusinessHoursDefaultValues } from './utils'

import css from './EditCustomBusinessHoursForm.less'

type Props = {
    businessHours: BusinessHoursDetails
}

export default function EditCustomBusinessHoursForm({ businessHours }: Props) {
    return (
        <Form<EditCustomBusinessHoursFormValues>
            mode="all"
            defaultValues={getEditCustomBusinessHoursDefaultValues(
                businessHours,
            )}
            onValidSubmit={noop}
            validator={(values) => {
                const relevantValues = omit(values, [
                    'previous_assigned_integrations',
                    'temporary_assigned_integrations',
                ])
                return toFormErrors(
                    validateBusinessHoursDetails(relevantValues),
                )
            }}
        >
            <div className={css.formContent}>
                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle>General</SettingsCardTitle>
                        <p>
                            Edit the title and the timezone for your custom
                            business hours.
                        </p>
                    </SettingsCardHeader>

                    <SettingsCardContent>
                        <CustomBusinessHoursGeneralFields horizontal />
                    </SettingsCardContent>
                </SettingsCard>

                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle>Schedule</SettingsCardTitle>
                        <p>
                            Add one or multiple time ranges to create your
                            custom schedule.
                        </p>
                    </SettingsCardHeader>
                    <SettingsCardContent>
                        <TimeScheduleField name="business_hours_config.business_hours" />
                    </SettingsCardContent>
                </SettingsCard>

                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle>Integrations</SettingsCardTitle>
                        <p>
                            Remove or assign one or multiple integrations for
                            your custom business hours.
                        </p>
                    </SettingsCardHeader>
                    <SettingsCardContent>
                        <EditCustomBusinessHoursIntegrationsSection />
                    </SettingsCardContent>
                </SettingsCard>
                <EditCustomBusinessHoursActions />
                {/* TODO: add onSave */}
                <FormUnsavedChangesPrompt onSave={noop} />
            </div>
        </Form>
    )
}
