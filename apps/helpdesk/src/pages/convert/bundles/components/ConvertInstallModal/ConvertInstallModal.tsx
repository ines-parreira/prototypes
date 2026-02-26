import React, { useEffect, useMemo, useState } from 'react'

import type { Map } from 'immutable'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import type { BundleActionResponse } from 'models/convert/bundle/types'
import {
    BundleInstallationMethod,
    BundleStatus,
} from 'models/convert/bundle/types'
import { IntegrationType } from 'models/integration/constants'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'
import BundleManualInstallationCard from 'pages/convert/bundles/components/BundleManualInstallationCard/BundleManualInstallationCard'
import { useGetConvertBundle } from 'pages/convert/bundles/hooks/useGetConvertBundle'
import { useInstallBundle } from 'pages/convert/bundles/hooks/useInstallBundle'
import useIsManualInstallationMethodRequired from 'pages/convert/common/hooks/useIsManualInstallationMethodRequired'
import useThemeAppExtensionInstallation from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useThemeAppExtensionInstallation'

type Props = {
    isOpen: boolean
    isConnectedToShopify?: boolean
    integration: Map<string, string>
    chatIntegration: Map<string, string>
    initialBundleData?: BundleActionResponse
    onSubmit: (data: BundleActionResponse) => void
    onClose: () => void
}

const ConvertInstallModal = ({
    isOpen,
    isConnectedToShopify,
    onSubmit,
    onClose,
    integration,
    chatIntegration,
    initialBundleData,
}: Props) => {
    const appNode = useAppNode()

    const [installationMethod, setInstallationMethod] =
        useState<BundleInstallationMethod>(BundleInstallationMethod.OneClick)

    const [showManual, setShowManual] = useState(false)

    const [bundleData, setBundleData] = useState<BundleActionResponse>()

    useEffect(() => {
        setBundleData(initialBundleData)
    }, [initialBundleData])

    useEffect(() => {
        // Reset on integration change
        setShowManual(false)
    }, [integration])

    const integrationId = useMemo(
        () => parseInt(integration.get('id')) || 0,
        [integration],
    )

    const onInstall = (data: BundleActionResponse) => {
        setBundleData(data)

        if (installationMethod === BundleInstallationMethod.OneClick) {
            onSubmit(data)
        } else {
            setShowManual(true)
        }
    }

    const isManualMethodRequired = useIsManualInstallationMethodRequired(
        chatIntegration.toJS(),
        integration.toJS(),
    )

    useEffect(() => {
        setInstallationMethod(
            isManualMethodRequired
                ? BundleInstallationMethod.Manual
                : BundleInstallationMethod.OneClick,
        )
    }, [isManualMethodRequired])

    const { bundle } = useGetConvertBundle(integrationId)

    useEffect(() => {
        if (
            bundle &&
            bundle.status === BundleStatus.Installed &&
            bundle.method === BundleInstallationMethod.Manual
        ) {
            setShowManual(true)
        }
    }, [bundle])

    const { shouldUseThemeAppExtensionInstallation } =
        useThemeAppExtensionInstallation(
            isConnectedToShopify ? integration.toJS() : undefined,
        )

    const { isSubmitting, installBundle } = useInstallBundle(
        integrationId,
        installationMethod,
        onInstall,
    )

    const manualInstallationLabel = useMemo(() => {
        if (shouldUseThemeAppExtensionInstallation) {
            return 'Add the campaign bundle on your ecommerce store to display onsite campaigns.'
        }
        return 'Add the campaign bundle to non-Shopify stores, Shopify Headless, specific pages on a Shopify store, or any other website.'
    }, [shouldUseThemeAppExtensionInstallation])

    return (
        <Modal
            isOpen={isOpen}
            toggle={onClose}
            autoFocus={true}
            backdrop="static"
            size="lg"
            zIndex={1561}
            container={appNode ?? undefined}
        >
            <ModalHeader toggle={onClose}>
                Install the campaign bundle
            </ModalHeader>
            <ModalBody>
                {showManual ? (
                    <BundleManualInstallationCard
                        bundleCode={bundleData?.code}
                        isConnected={false}
                        isBordered={false}
                        isConnectedToShopify={
                            integration?.get('type') === IntegrationType.Shopify
                        }
                    />
                ) : (
                    <div>
                        <p>
                            Select an installation method to add the campaign
                            bundle to your store or website:
                        </p>
                        {!shouldUseThemeAppExtensionInstallation && (
                            <PreviewRadioButton
                                value="one-click"
                                isSelected={
                                    installationMethod ===
                                    BundleInstallationMethod.OneClick
                                }
                                isDisabled={isManualMethodRequired}
                                label="1-click installation for Shopify"
                                caption="Install the campaign bundle on your Shopify store in one click."
                                onClick={() => {
                                    setInstallationMethod(
                                        BundleInstallationMethod.OneClick,
                                    )
                                }}
                            />
                        )}
                        <PreviewRadioButton
                            value="manual"
                            className="mt-3"
                            isSelected={
                                installationMethod ===
                                BundleInstallationMethod.Manual
                            }
                            label="Manual install"
                            caption={manualInstallationLabel}
                            onClick={() => {
                                setInstallationMethod(
                                    BundleInstallationMethod.Manual,
                                )
                            }}
                        />
                    </div>
                )}
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" className="mr-2" onClick={onClose}>
                    Cancel
                </Button>
                {showManual ? (
                    <Button
                        color="primary"
                        isLoading={isSubmitting}
                        onClick={() => !!bundleData && onSubmit(bundleData)}
                    >
                        Finish Setup
                    </Button>
                ) : (
                    <Button
                        color="primary"
                        isLoading={isSubmitting}
                        onClick={installBundle}
                    >
                        {installationMethod ===
                        BundleInstallationMethod.OneClick
                            ? 'Install Bundle'
                            : 'Next'}
                    </Button>
                )}
            </ModalActionsFooter>
        </Modal>
    )
}

export default ConvertInstallModal
