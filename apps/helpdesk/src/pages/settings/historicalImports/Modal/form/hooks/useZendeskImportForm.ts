import { useMemo, useState } from 'react'

import type { CreateIntegrationBody } from '@gorgias/helpdesk-queries'
import { useCreateIntegration } from '@gorgias/helpdesk-queries'

import { IntegrationType } from 'models/integration/types'
import { subdomain as extractSubdomain, isEmail } from 'utils'

const ZENDESK_CONNECTION_TYPE = 'zendesk_auth_data'

type UseZendeskImportFormProps = {
    onSuccess: () => void
    onError: () => void
}

export const useZendeskImportForm = ({
    onSuccess,
    onError,
}: UseZendeskImportFormProps) => {
    const [subdomain, setSubdomain] = useState('')
    const [loginEmail, setLoginEmail] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [emailError, setEmailError] = useState<string>('')

    const { mutate: createIntegration, isLoading } = useCreateIntegration({
        mutation: {
            onSuccess,
            onError,
        },
    })

    const handleEmailChange = (email: string) => {
        setLoginEmail(email)

        if (email && !isEmail(email)) {
            setEmailError('Please enter a valid email address')
        } else {
            setEmailError('')
        }
    }

    const isFormValid = useMemo(
        () => Boolean(subdomain && loginEmail && apiKey && !emailError),
        [subdomain, loginEmail, apiKey, emailError],
    )

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault()

        if (!isFormValid) {
            return
        }

        const processedDomain = extractSubdomain(subdomain)

        const integrationData = {
            name: processedDomain,
            type: IntegrationType.Zendesk,
            connections: [
                {
                    type: ZENDESK_CONNECTION_TYPE,
                    data: {
                        domain: processedDomain,
                        email: loginEmail,
                        api_key: apiKey,
                    },
                },
            ],
            deactivated_datetime: new Date().toISOString(),
        }

        createIntegration({
            data: integrationData as CreateIntegrationBody,
        })
    }

    return {
        formState: {
            subdomain,
            loginEmail,
            apiKey,
        },
        formErrors: {
            emailError,
        },
        formActions: {
            setSubdomain,
            setLoginEmail: handleEmailChange,
            setApiKey,
        },
        isLoading,
        isFormValid,
        handleSubmit,
    }
}
