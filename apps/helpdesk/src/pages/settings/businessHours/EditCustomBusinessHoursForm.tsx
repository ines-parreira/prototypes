import { Form, toFormErrors } from '@repo/forms'
import { history } from '@repo/routing'

import { useUpdateBusinessHours } from '@gorgias/helpdesk-queries'
import type { BusinessHoursDetails } from '@gorgias/helpdesk-types'
import { validateBusinessHoursUpdate } from '@gorgias/helpdesk-validators'

import { useNotify } from 'hooks/useNotify'
import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import TimeScheduleField from 'pages/common/components/TimeScheduleField/TimeScheduleField'

import { BUSINESS_HOURS_BASE_URL } from './constants'
import CustomBusinessHoursGeneralFields from './CustomBusinessHoursGeneralFields'
import EditCustomBusinessHoursActions from './EditCustomBusinessHoursActions'
import EditCustomBusinessHoursIntegrationsSection from './EditCustomBusinessHoursIntegrationsSection'
import type { EditCustomBusinessHoursFormValues } from './types'
import { useCustomBusinessHoursForm } from './useCustomBusinessHoursForm'
import {
    getEditCustomBusinessHoursDefaultValues,
    getUpdateBusinessHoursPayloadFromValues,
} from './utils'

import css from './EditCustomBusinessHoursForm.less'

type Props = {
    businessHours: BusinessHoursDetails
}

export default function EditCustomBusinessHoursForm({ businessHours }: Props) {
    const notify = useNotify()
    const { clientSideValidation } = useCustomBusinessHoursForm()

    const { mutate: updateBusinessHours, isLoading } = useUpdateBusinessHours({
        mutation: {
            onSuccess: (response) => {
                notify.success(
                    `'${response.data.name}' business hours were successfully updated.`,
                )

                history.push(BUSINESS_HOURS_BASE_URL)
            },
            onError: () => {
                notify.error(
                    "We couldn't save your preferences. Please try again.",
                )
            },
        },
    })

    const handleFormSubmit = (values: EditCustomBusinessHoursFormValues) => {
        updateBusinessHours({
            id: businessHours.id,
            data: getUpdateBusinessHoursPayloadFromValues(values),
        })
    }

    const validator = (values: EditCustomBusinessHoursFormValues) => {
        const customValidationErrors = clientSideValidation(values)
        const payload = getUpdateBusinessHoursPayloadFromValues(values)
        const errors = toFormErrors(validateBusinessHoursUpdate(payload))
        return { ...errors, ...customValidationErrors }
    }

    return (
        <Form<EditCustomBusinessHoursFormValues>
            defaultValues={getEditCustomBusinessHoursDefaultValues(
                businessHours,
            )}
            onValidSubmit={handleFormSubmit}
            validator={validator}
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
                        <TimeScheduleField
                            name="business_hours_config.business_hours"
                            withCaption={false}
                        />
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
                <EditCustomBusinessHoursActions
                    businessHours={businessHours}
                    isLoading={isLoading}
                />
                <FormUnsavedChangesPrompt onSave={handleFormSubmit} />
            </div>
        </Form>
    )
}
