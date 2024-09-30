import React, {useState} from 'react'

import classnames from 'classnames'
import {ContactFormField} from 'pages/convert/campaigns/types/CampaignAttachment'
import {MailInput, ErrorMessage} from './styled'
import css from './CampaignCaptureFormPreview.less'

const USER_EMAIL_MAX_LENGTH = 320
const EMAIL_REGEX = `^[a-zA-Z0-9_\\-\\+\\.]+@([a-zA-Z0-9_][a-zA-Z0-9_\\-]+\\.)+(?!(?:con|cin|cim|comd|couk|ul|netk|coml|comok)$)[a-zA-Z0-9\\-]{1,63}$`

export type EmailCaptureFieldProps = {
    field: ContactFormField
    onChange: (value?: string) => void
}

export const EmailCaptureField: React.FC<EmailCaptureFieldProps> = ({
    field,
    onChange,
}) => {
    const [errorMessage, setErrorMessage] = useState<string>()

    const handleEmailChange = (value: string) => {
        if (errorMessage) {
            handleInvalidInput(value)
        }

        onChange(value && value.match(EMAIL_REGEX) ? value : undefined)
    }

    const handleInvalidInput = (value: string) => {
        if (field.required && !value) {
            setErrorMessage('Missing required field.')
        } else if (value && !value.match(EMAIL_REGEX)) {
            setErrorMessage('Enter a valid email address.')
        } else {
            setErrorMessage(undefined)
        }
    }

    return (
        <>
            <MailInput
                aria-label="Provide your email"
                placeholder={field.label || 'Email'}
                onChange={(event) => handleEmailChange(event.target.value)}
                onBlur={(event) => handleInvalidInput(event.target.value)}
                type="email"
                name={field.name}
                autoComplete="email"
                maxLength={USER_EMAIL_MAX_LENGTH}
                required={field.required}
                pattern={EMAIL_REGEX}
                className={classnames({[css.errorState]: !!errorMessage})}
            />
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </>
    )
}
