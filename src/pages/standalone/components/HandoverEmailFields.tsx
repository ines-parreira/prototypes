import { FC, useRef } from 'react'

import { FieldErrors, UseFormSetValue } from 'react-hook-form'

import { Label } from '@gorgias/merchant-ui-kit'

import InputField from 'pages/common/forms/input/InputField'
import {
    EmailItem,
    HandoverEmailDropdown,
} from 'pages/standalone/components/HandoverEmailDropdown'
import css from 'pages/standalone/components/HandoverEmailFields.less'
import { EMAIL_INTEGRATION_PATH } from 'pages/standalone/constants'
import { HandoverFormValues } from 'pages/standalone/schemas'

export const HandoverEmailFields: FC<{
    setValue: UseFormSetValue<HandoverFormValues>
    emailIntegration?: number
    selectableEmailIntegrations: EmailItem[]
    email: string
    errors: FieldErrors<HandoverFormValues>
}> = ({
    setValue,
    emailIntegration,
    selectableEmailIntegrations,
    email,
    errors,
}) => {
    const emailDropdownRef = useRef<HTMLDivElement | null>(null)
    const emailFieldRef = useRef<HTMLInputElement | null>(null)

    return (
        <div className={css.container}>
            <div ref={emailDropdownRef} className={css.emailList}>
                <Label isRequired={true} id="outbound-email-integration">
                    Email from which handover emails will be sent
                </Label>
                <div>
                    <HandoverEmailDropdown
                        labelId="outbound-email-integration"
                        onSelectionChange={(integration) => {
                            setValue('emailIntegration', integration)
                        }}
                        selectedId={emailIntegration}
                        emailItems={selectableEmailIntegrations}
                        hasError={!!errors.emailIntegration}
                        error={errors.emailIntegration?.message}
                    />
                    <a href={EMAIL_INTEGRATION_PATH} className={css.link}>
                        <small>
                            {"Don't see the email you want? Click here"}
                        </small>
                    </a>
                </div>
            </div>

            <InputField
                type="email"
                label="Email that will receive handover conversations"
                placeholder="Enter email address"
                value={email}
                onChange={(value) => setValue('email', value)}
                isRequired={true}
                isDisabled={false}
                ref={emailFieldRef}
                error={errors.email?.message}
                hasError={!!errors.email}
            />
        </div>
    )
}
