import React, {useEffect, useMemo, useState} from 'react'
import {Modal, ModalBody, ModalHeader} from 'reactstrap'
import {Map} from 'immutable'
import {IntegrationType} from 'models/integration/constants'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import Button from 'pages/common/components/button/Button'
import {
    RevenueBundleActionResponse,
    RevenueBundleInstallationMethod,
} from 'models/revenueBundles/types'
import useAsyncFn from 'hooks/useAsyncFn'
import client from 'models/api/resources'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {transformBundleError} from 'pages/settings/revenue/utils/transformBundleError'
import useAppDispatch from 'hooks/useAppDispatch'
import {useAppNode} from 'appNode'
import BundleManualInstallationCard from 'pages/settings/revenue/components/BundlesView/BundleManualInstallationCard'

type Props = {
    isOpen: boolean
    integration: Map<string, string>
    onSubmit: (data: RevenueBundleActionResponse) => void
    onClose: () => void
}

const ConvertInstallModal = ({
    isOpen,
    onSubmit,
    onClose,
    integration,
}: Props) => {
    const dispatch = useAppDispatch()
    const appNode = useAppNode()

    const [installationMethod, setInstallationMethod] =
        useState<RevenueBundleInstallationMethod>(
            RevenueBundleInstallationMethod.OneClick
        )

    const [showManual, setShowManual] = useState<boolean>(false)
    const [bundleData, setBundleData] = useState<
        RevenueBundleActionResponse | undefined
    >()

    const integrationId = useMemo((): number | null => {
        if (!integration) {
            return null
        }
        return parseInt(integration.get('id'))
    }, [integration])

    const isManualMethodRequired = useMemo(() => {
        return (
            integration && integration.get('type') !== IntegrationType.Shopify
        )
    }, [integration])

    useEffect(() => {
        setInstallationMethod(
            isManualMethodRequired
                ? RevenueBundleInstallationMethod.Manual
                : RevenueBundleInstallationMethod.OneClick
        )
    }, [isManualMethodRequired])

    const [{loading: isSubmitting}, installBundle] = useAsyncFn(async () => {
        if (!integrationId) {
            return
        }

        let action = 'install'
        let message = 'Bundle installed successfully'
        if (installationMethod === RevenueBundleInstallationMethod.Manual) {
            action = 'manual-install'
            message = 'Ready for installation, please follow the instructions'
        }

        try {
            const {data} = await client.post<RevenueBundleActionResponse>(
                `/api/revenue-addon-bundle/${action}/`,
                {
                    integration_id: integrationId,
                }
            )

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: message,
                })
            )

            setBundleData(data)

            if (
                installationMethod === RevenueBundleInstallationMethod.OneClick
            ) {
                onSubmit(data)
            } else {
                setShowManual(true)
            }
        } catch (e) {
            void dispatch(
                notify(
                    transformBundleError(
                        e,
                        "We couldn't install the bundle. Please try again.",
                        integrationId
                    )
                )
            )
        }
    }, [integrationId, installationMethod])

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
                        isConnected={!!integrationId}
                        isConnectedToShopify={
                            integration?.get('type') === IntegrationType.Shopify
                        }
                        isInstalledManually={false}
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
                                RevenueBundleInstallationMethod.OneClick
                            }
                            isDisabled={isManualMethodRequired}
                            label="1-click installation for Shopify"
                            caption="Install the campaign bundle on your Shopify store in one click."
                            onClick={() => {
                                setInstallationMethod(
                                    RevenueBundleInstallationMethod.OneClick
                                )
                            }}
                        />
                        <PreviewRadioButton
                            value="manual"
                            className="mt-3"
                            isSelected={
                                installationMethod ===
                                RevenueBundleInstallationMethod.Manual
                            }
                            label="Manual install"
                            caption="Add the campaign bundle to non-Shopify stores, Shopify Headless, specific pages on a Shopify store, or any other website."
                            onClick={() => {
                                setInstallationMethod(
                                    RevenueBundleInstallationMethod.Manual
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
                        RevenueBundleInstallationMethod.OneClick
                            ? 'Install Bundle'
                            : 'Next'}
                    </Button>
                )}
            </ModalActionsFooter>
        </Modal>
    )
}

export default ConvertInstallModal
