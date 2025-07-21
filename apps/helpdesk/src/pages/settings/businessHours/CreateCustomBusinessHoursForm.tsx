import { BusinessHoursCreate } from '@gorgias/helpdesk-queries'
import { validateBusinessHoursCreate } from '@gorgias/helpdesk-validators'

import { Form, toFormErrors } from 'core/forms'
import useAppSelector from 'hooks/useAppSelector'
import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

import { getCreateBusinessHoursFormDefaultValues } from './utils'

type Props = {
    children: React.ReactNode
    onSubmit: (values: BusinessHoursCreate) => void
}

export default function CreateCustomBusinessHoursForm({
    children,
    onSubmit,
}: Props) {
    const businessHoursSettings = useAppSelector(getBusinessHoursSettings)
    const defaultTimezone = businessHoursSettings?.data?.timezone

    const validator = (values: BusinessHoursCreate) => {
        return toFormErrors(validateBusinessHoursCreate(values))
    }

    return (
        <>
            <Form<BusinessHoursCreate>
                onValidSubmit={onSubmit}
                mode="all"
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
