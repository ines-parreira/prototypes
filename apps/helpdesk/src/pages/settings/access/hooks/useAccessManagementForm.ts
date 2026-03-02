import { useEffect, useMemo, useState } from 'react'

import type { ModalMode } from '../types'
import type { TouchedFields, UseAccessManagementFormProps } from './types'

const validateProviderName = (name: string) => {
    if (!name.trim()) {
        return 'Provider name is required'
    }
    return null
}

const validateProviderUrl = (url: string) => {
    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
        return 'Provider URL is required'
    }

    let providerUrl = trimmedUrl

    // add `https://` prefix if missing
    if (!providerUrl.startsWith('https://')) {
        providerUrl = `https://${providerUrl}`
    }

    // should have top-level domain (local urls are not valid)
    if (!providerUrl.match(/\w+\.\w+/)) {
        return 'Please enter a valid URL or domain'
    }

    // validate URL
    try {
        new URL(providerUrl)
        return null
    } catch {
        return 'Please enter a valid URL or domain'
    }
}

const validateClientId = (clientId: string) => {
    if (!clientId.trim()) {
        return 'Client ID is required'
    }
    return null
}

const validateClientSecret = (clientSecret: string, mode: ModalMode) => {
    if (mode === 'create' && !clientSecret.trim()) {
        return 'Client secret is required'
    }
    return null
}

export const useAccessManagementForm = ({
    clientId,
    clientSecret,
    metadataUrl,
    mode,
    onValidationChange,
    providerName,
}: UseAccessManagementFormProps) => {
    const [touchedFields, setTouchedFields] = useState<TouchedFields>({
        providerName: false,
        clientId: false,
        clientSecret: false,
        metadataUrl: false,
    })

    const markFieldAsTouched = (fieldName: keyof TouchedFields) => {
        setTouchedFields((prev) => ({ ...prev, [fieldName]: true }))
    }
    const validationErrors = useMemo(
        () => ({
            providerName: validateProviderName(providerName),
            clientId: validateClientId(clientId),
            clientSecret: validateClientSecret(clientSecret || '', mode),
            metadataUrl: validateProviderUrl(metadataUrl),
        }),
        [providerName, clientId, clientSecret, mode, metadataUrl],
    )

    const isFormValid = useMemo(() => {
        return Object.values(validationErrors).every((error) => error === null)
    }, [validationErrors])

    useEffect(() => {
        onValidationChange?.(isFormValid)
    }, [isFormValid, onValidationChange])

    const fieldErrors = useMemo(
        () => ({
            providerName:
                (touchedFields.providerName && validationErrors.providerName) ||
                undefined,
            clientId:
                (touchedFields.clientId && validationErrors.clientId) ||
                undefined,
            clientSecret:
                (touchedFields.clientSecret && validationErrors.clientSecret) ||
                undefined,
            metadataUrl:
                (touchedFields.metadataUrl && validationErrors.metadataUrl) ||
                undefined,
        }),
        [validationErrors, touchedFields],
    )

    return {
        fieldErrors,
        isFormValid,
        markFieldAsTouched,
        validationErrors,
    }
}
