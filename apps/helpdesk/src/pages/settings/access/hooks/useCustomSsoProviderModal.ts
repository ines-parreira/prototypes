import { useEffect, useState } from 'react'

import type { CustomSSOProviderData, ModalMode } from '../types'
import type {
    UseCustomSsoProviderModalProps,
    UseCustomSsoProviderModalStateProps,
} from './types'

/**
 * Processes the metadata URL to ensure it's in the correct format for OpenID Connect
 * - Strips https:// prefix if present
 * - Removes /.well-known/openid-configuration suffix if present
 * - Removes trailing slashes
 * - Returns the processed URL that will be formatted as https://{provider_url}/.well-known/openid-configuration
 */
const processMetadataUrl = (url: string): string => {
    let processedUrl = url.trim()

    // Strip https:// prefix if present
    if (processedUrl.startsWith('https://')) {
        processedUrl = processedUrl.substring(8)
    }

    // Remove /.well-known/openid-configuration suffix if present (including any trailing slashes)
    const wellKnownSuffix = '/.well-known/openid-configuration'
    if (processedUrl.includes(wellKnownSuffix)) {
        const suffixIndex = processedUrl.indexOf(wellKnownSuffix)
        processedUrl = processedUrl.substring(0, suffixIndex)
    }

    // Remove trailing slashes
    processedUrl = processedUrl.replace(/\/+$/, '')

    return processedUrl
}

export const useCustomSsoProviderModal = ({
    initialData,
    isOpen,
    mode,
    onSave,
    editingProviderId,
}: UseCustomSsoProviderModalProps) => {
    const [name, setName] = useState('')
    const [clientId, setClientId] = useState('')
    const [clientSecret, setClientSecret] = useState<string | undefined>()
    const [metadataUrl, setMetadataUrl] = useState('')
    const [isFormValid, setIsFormValid] = useState(false)

    // Reset form when modal opens/closes or mode/data changes
    useEffect(() => {
        setClientSecret(undefined)
        if (mode === 'edit' && initialData) {
            setName(initialData.name)
            setClientId(initialData.clientId)
            setMetadataUrl(initialData.metadataUrl)
        } else {
            setName('')
            setClientId('')
            setMetadataUrl('')
        }
    }, [mode, initialData, isOpen])

    const handleSave = () => {
        const processedMetadataUrl = processMetadataUrl(metadataUrl)
        const formattedMetadataUrl = `https://${processedMetadataUrl}/.well-known/openid-configuration`

        const providerData = {
            name,
            clientId,
            metadataUrl: formattedMetadataUrl,
            clientSecret: clientSecret,
        }

        onSave(providerData, editingProviderId)
    }

    return {
        // Form state
        name,
        clientId,
        clientSecret,
        metadataUrl,
        isFormValid,

        // Form handlers
        setName,
        setClientId,
        setMetadataUrl,
        setClientSecret,
        setIsFormValid,

        // Modal handlers
        handleSave,
    }
}

export const useCustomSsoProviderModalState = ({
    setShowModal,
    onSave,
}: UseCustomSsoProviderModalStateProps) => {
    const [modalMode, setModalMode] = useState<ModalMode>('create')
    const [editingProviderId, setEditingProviderId] = useState<string | null>(
        null,
    )
    const [editingProviderData, setEditingProviderData] =
        useState<CustomSSOProviderData | null>(null)

    const openCreateModal = () => {
        setModalMode('create')
        setEditingProviderId(null)
        setEditingProviderData(null)
        setShowModal(true)
    }

    const openEditModal = (
        providerId: string,
        providerData: CustomSSOProviderData,
    ) => {
        setEditingProviderId(providerId)
        setEditingProviderData(providerData)
        setModalMode('edit')
        setShowModal(true)
    }

    const handleSaveProvider = async (
        providerData: CustomSSOProviderData,
        providerId?: string | null,
    ) => {
        const success = await onSave(providerData, providerId)
        if (success) {
            setShowModal(false)
        }
    }

    return {
        // Modal state
        modalMode,
        editingProviderId,
        editingProviderData,

        // Modal actions
        openCreateModal,
        openEditModal,
        handleSaveProvider,
    }
}
