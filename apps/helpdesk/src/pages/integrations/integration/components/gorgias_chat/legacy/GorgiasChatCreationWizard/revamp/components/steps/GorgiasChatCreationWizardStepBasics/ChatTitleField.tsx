import { TextField } from '@gorgias/axiom'

import css from './GorgiasChatCreationWizardStepBasics.less'

type ChatTitleFieldProps = {
    name: string
    hasFailedSubmit: boolean
    onChange: (value: string) => void
}

export const ChatTitleField = ({
    name,
    hasFailedSubmit,
    onChange,
}: ChatTitleFieldProps) => (
    <div className={css.constrainedInput}>
        <TextField
            label="Chat title"
            isRequired
            value={name}
            onChange={onChange}
            error={
                hasFailedSubmit && !name ? 'This field is required.' : undefined
            }
            caption="Give your chat a name for internal reference. This title won't be visible to customers."
        />
    </div>
)
