import React, { useEffect, useState } from 'react'

import { fromJS } from 'immutable'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { loadIntegration } from 'models/integration/resources/alloy'
import type { AlloyIntegration } from 'models/integration/types/alloy'
import {
    deleteIntegration,
    updateOrCreateIntegrationRequest,
} from 'state/integrations/actions'
import {
    getIntegrationsByType,
    getIntegrationsLoading,
} from 'state/integrations/selectors'

function installAlloy(integrationId: string, userToken: string): Promise<void> {
    return new Promise((resolve) => {
        window.Alloy.setToken(userToken)
        window.Alloy.install({
            integrationId,
            callback: resolve,
            alwaysShowAuthentication: false,
            hide: false,
        })
    })
}

type Props = {
    name: string
    appId: string
    integrationId: string
}

export default function AlloyConnectButton({
    name,
    appId,
    integrationId,
}: Props) {
    const dispatch = useAppDispatch()
    const [isInstalling, setIsInstalling] = useState(false)

    // Get the first matching Alloy integration with this ID
    const alloyIntegrations = useAppSelector(
        getIntegrationsByType<AlloyIntegration>(IntegrationType.Alloy),
    ).filter(
        (integration) => integration.meta['integration_id'] === integrationId,
    )
    const alloyIntegration = alloyIntegrations.length
        ? alloyIntegrations[0]
        : null

    // Check if the integration is currently being updated
    const loading = useAppSelector(getIntegrationsLoading)
    const isLoading =
        (loading?.updateIntegration &&
            loading.updateIntegration === alloyIntegration?.id) ||
        loading?.delete

    // Setup Alloy embedded SDK
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://cdn.runalloy.com/scripts/embedded.js'
        script.async = false
        document.body.appendChild(script)
        return () => {
            document.body.removeChild(script)
        }
    }, [])

    // Button handlers
    const handleInstall = async () => {
        setIsInstalling(true)
        try {
            let info = await loadIntegration(integrationId)

            // Can happen if the Alloy install worked but not the integration creation
            if (!info?.isInstalled) {
                await installAlloy(integrationId, info.userToken)
                info = await loadIntegration(integrationId)
            }

            // Only create the integration if Alloy was really installed, and the user didn't just close the modal
            if (info?.isInstalled) {
                const integration = fromJS({
                    name,
                    type: IntegrationType.Alloy,
                    meta: {
                        app_id: appId,
                        integration_id: integrationId,
                    },
                })
                dispatch(
                    updateOrCreateIntegrationRequest(
                        integration,
                        undefined,
                        null,
                        true,
                    ),
                )
            }
        } finally {
            setIsInstalling(false)
        }
    }
    const handleDisconnect = () => {
        dispatch(deleteIntegration(fromJS(alloyIntegration!)))
    }

    return (
        <>
            {!alloyIntegration ? (
                <Button
                    onClick={handleInstall}
                    isLoading={isInstalling || isLoading}
                >
                    Connect App
                </Button>
            ) : (
                <Button
                    intent="destructive"
                    onClick={handleDisconnect}
                    isLoading={isLoading}
                >
                    Disconnect App
                </Button>
            )}
        </>
    )
}
