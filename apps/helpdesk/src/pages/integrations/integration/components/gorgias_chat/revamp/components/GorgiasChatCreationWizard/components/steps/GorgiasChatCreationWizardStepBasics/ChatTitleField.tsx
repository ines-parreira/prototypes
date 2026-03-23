import { useState } from 'react'

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
}: ChatTitleFieldProps) => {
    const [isTouched, setIsTouched] = useState(false)

    return (
        <div className={css.constrainedInput}>
            <TextField
                label="Chat title"
                isRequired
                value={name}
                onChange={onChange}
                onBlur={() => setIsTouched(true)}
                error={
                    (hasFailedSubmit || isTouched) && !name
                        ? 'This field is required.'
                        : undefined
                }
                caption="Give your chat a name for internal reference. This title won't be visible to customers."
            />
        </div>
    )
}
