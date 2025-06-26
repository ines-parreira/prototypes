import { Form } from 'core/forms'
import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'

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
