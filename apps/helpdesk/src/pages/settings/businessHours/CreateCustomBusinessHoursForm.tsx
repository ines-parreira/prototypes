import { validateBusinessHoursCreate } from '@gorgias/helpdesk-validators'

import { Form, toFormErrors } from 'core/forms'
import useAppSelector from 'hooks/useAppSelector'
import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

import { BusinessHoursCreateFormValues } from './types'
import { useCustomBusinessHoursForm } from './useCustomBusinessHoursForm'
import {
    getCreateBusinessHoursFormDefaultValues,
    getCreateCustomBusinessHoursPayloadFromValues,
} from './utils'

type Props = {
    children: React.ReactNode
    onSubmit: (values: BusinessHoursCreateFormValues) => void
}

export default function CreateCustomBusinessHoursForm({
    children,
    onSubmit,
}: Props) {
    const businessHoursSettings = useAppSelector(getBusinessHoursSettings)
    const defaultTimezone = businessHoursSettings?.data?.timezone
    const { clientSideValidation } = useCustomBusinessHoursForm()

    const validator = (values: BusinessHoursCreateFormValues) => {
        const customValidationErrors = clientSideValidation(values)

        const payload = getCreateCustomBusinessHoursPayloadFromValues(values)
        const errors = toFormErrors(validateBusinessHoursCreate(payload))
        return { ...errors, ...customValidationErrors }
    }

    return (
        <>
            <Form<BusinessHoursCreateFormValues>
                onValidSubmit={onSubmit}
                defaultValues={getCreateBusinessHoursFormDefaultValues(
                    defaultTimezone,
                )}
                validator={validator}
            >
                {children}
                <FormUnsavedChangesPrompt onSave={onSubmit} />
            </Form>
        </>
    )
}
