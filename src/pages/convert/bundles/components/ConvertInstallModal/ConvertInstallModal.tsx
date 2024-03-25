import React, {useEffect, useMemo, useState} from 'react'
import {Modal, ModalBody, ModalHeader} from 'reactstrap'
import {Map} from 'immutable'
import {IntegrationType} from 'models/integration/constants'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import Button from 'pages/common/components/button/Button'
import {useAppNode} from 'appNode'
import BundleManualInstallationCard from 'pages/convert/bundles/components/BundleManualInstallationCard/BundleManualInstallationCard'
import {useInstallBundle} from 'pages/convert/bundles/hooks/useInstallBundle'
import {useGetConvertBundle} from 'pages/convert/bundles/hooks/useGetConvertBundle'

import {
    BundleActionResponse,
    BundleInstallationMethod,
    BundleStatus,
} from 'models/convert/bundle/types'

type Props = {
    isOpen: boolean
    integration: Map<string, string>
    initialBundleData?: BundleActionResponse
    onSubmit: (data: BundleActionResponse) => void
    onClose: () => void
}

const ConvertInstallModal = ({
    isOpen,
    onSubmit,
    onClose,
    integration,
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

    const integrationId = useMemo(
        () => parseInt(integration.get('id')) || 0,
        [integration]
    )

    const onInstall = (data: BundleActionResponse) => {
        setBundleData(data)

        if (installationMethod === BundleInstallationMethod.OneClick) {
            onSubmit(data)
        } else {
            setShowManual(true)
        }
    }

    const isManualMethodRequired = useMemo(() => {
        return (
            integration && integration.get('type') !== IntegrationType.Shopify
        )
    }, [integration])

    useEffect(() => {
        setInstallationMethod(
            isManualMethodRequired
                ? BundleInstallationMethod.Manual
                : BundleInstallationMethod.OneClick
        )
    }, [isManualMethodRequired])

    const {bundle} = useGetConvertBundle(integrationId)

    useEffect(() => {
        if (
            bundle &&
            bundle.status === BundleStatus.Installed &&
            bundle.method === BundleInstallationMethod.Manual
        ) {
            setShowManual(true)
        }
    }, [bundle])

    const {isSubmitting, installBundle} = useInstallBundle(
        integrationId,
        installationMethod,
        onInstall
    )

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
                                    BundleInstallationMethod.OneClick
                                )
                            }}
                        />
                        <PreviewRadioButton
                            value="manual"
                            className="mt-3"
                            isSelected={
                                installationMethod ===
                                BundleInstallationMethod.Manual
                            }
                            label="Manual install"
                            caption="Add the campaign bundle to non-Shopify stores, Shopify Headless, specific pages on a Shopify store, or any other website."
                            onClick={() => {
                                setInstallationMethod(
                                    BundleInstallationMethod.Manual
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
