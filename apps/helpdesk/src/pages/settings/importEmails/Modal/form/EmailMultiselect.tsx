import React from 'react'

import { LegacyLabel as Label } from '@gorgias/axiom'
import { IntegrationType } from '@gorgias/helpdesk-client'

import RadioFieldSet from 'pages/common/forms/RadioFieldSet'

import { EmailSelectSearch } from './EmailSelectSearch'
import { useEmailIntegrations } from './hooks/useEmailIntegrations'

import css from '../CreateImportModal.less'

export type EmailOption = {
    provider: IntegrationType
    email: string
}

type EmailMultiselectProps = {
    email: string
    setEmail: (email: string) => void
    handleProviderChange: (provider: string) => void
    forwardingProvider: string | null
}

export const EmailMultiselect = ({
    email,
    setEmail,
    handleProviderChange,
    forwardingProvider = null,
}: EmailMultiselectProps) => {
    const emailOptions = useEmailIntegrations()

    const selectedProvider =
        emailOptions.find((option) => option.email === email)?.provider || null

    const showProviderRadios = selectedProvider === IntegrationType.Email

    const providerOptions = [
        IntegrationType.Gmail,
        IntegrationType.Outlook,
    ].map((provider) => ({
        value: provider,
        label: provider.charAt(0).toUpperCase() + provider.slice(1),
    }))

    return (
        <>
            <div className={css.formGroup}>
                <Label className="mb-2" isRequired>
                    Email
                </Label>
                <EmailSelectSearch
                    emailOptions={emailOptions}
                    email={email}
                    setEmail={setEmail}
                />
            </div>
            {showProviderRadios && (
                <div className={css.formGroup}>
                    <Label className="mb-2" isRequired>
                        Provider
                    </Label>
                    <RadioFieldSet
                        options={providerOptions}
                        selectedValue={forwardingProvider}
                        onChange={handleProviderChange}
                        isHorizontal={true}
                    />
                </div>
            )}
        </>
    )
}
