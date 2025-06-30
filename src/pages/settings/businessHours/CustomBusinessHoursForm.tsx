import { Form } from 'core/forms'
import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'

import { CUSTOM_BUSINESS_HOURS_DEFAULT_VALUES } from './constants'

type Props = {
    children: React.ReactNode
    onSubmit: () => void
}

export default function CustomBusinessHoursForm({ children, onSubmit }: Props) {
    return (
        <>
            <Form
                onValidSubmit={onSubmit}
                mode="onChange"
                defaultValues={CUSTOM_BUSINESS_HOURS_DEFAULT_VALUES}
                resetOptions={{
                    keepDirty: false,
                    keepDefaultValues: false,
                    keepDirtyValues: false,
                }}
            >
                {children}
                <FormUnsavedChangesPrompt onSave={onSubmit} />
            </Form>
        </>
    )
}
