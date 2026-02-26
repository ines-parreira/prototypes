import React, { useEffect, useMemo, useState } from 'react'

import type { List } from 'immutable'
import { useParams } from 'react-router-dom'
import { Container } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import {
    BundleInstallationMethod,
    BundleStatus,
} from 'models/convert/bundle/types'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'
import ConvertBundleDetail from 'pages/convert/bundles/components/ConvertBundleDetail'
import { useGetConvertBundle } from 'pages/convert/bundles/hooks/useGetConvertBundle'
import { useInstallBundle } from 'pages/convert/bundles/hooks/useInstallBundle'
import { CONVERT_ROUTE_PARAM_NAME } from 'pages/convert/common/constants'
import useIsManualInstallationMethodRequired from 'pages/convert/common/hooks/useIsManualInstallationMethodRequired'
import type { ConvertRouteParams } from 'pages/convert/common/types'
import useThemeAppExtensionInstallation from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useThemeAppExtensionInstallation'
import { getIntegrationById } from 'state/integrations/selectors'

import css from './ConvertBundleView.less'

type Props = {
    renderHeader?: boolean
}

const ConvertBundleView = ({ renderHeader = true }: Props) => {
    const { [CONVERT_ROUTE_PARAM_NAME]: paramIntegrationId } =
        useParams<ConvertRouteParams>()

    const chatIntegrationId = parseInt(paramIntegrationId || '')
    const chatIntegration = useAppSelector(
        getIntegrationById(chatIntegrationId),
    )

    const storeIntegrationId = useMemo(() => {
        if (
            chatIntegration &&
            chatIntegration.get('type') === GORGIAS_CHAT_INTEGRATION_TYPE
        ) {
            return (
                !!chatIntegration &&
                (chatIntegration.getIn([
                    'meta',
                    'shop_integration_id',
                ]) as number)
            )
        }
        return 0
    }, [chatIntegration])

    const storeIntegration = useAppSelector(
        getIntegrationById(storeIntegrationId),
    )

    const isConnectedToShopify = useMemo(
        () =>
            Boolean(
                storeIntegration &&
                    storeIntegration.get('type') === SHOPIFY_INTEGRATION_TYPE,
            ),
        [storeIntegration],
    )

    const { shouldUseThemeAppExtensionInstallation } =
        useThemeAppExtensionInstallation(
            isConnectedToShopify ? storeIntegration.toJS() : undefined,
        )

    const integrationId = useMemo(
        () =>
            Boolean(storeIntegrationId)
                ? storeIntegrationId
                : chatIntegrationId,
        [storeIntegrationId, chatIntegrationId],
    )

    const { bundle, isLoading } = useGetConvertBundle(
        storeIntegrationId,
        chatIntegrationId,
    )

    const isInstalled = useMemo(
        () => !!bundle && bundle.status === BundleStatus.Installed,
        [bundle],
    )

    // install
    const [installationMethod, setInstallationMethod] =
        useState<BundleInstallationMethod>(BundleInstallationMethod.OneClick)

    const isManualMethodRequired = useIsManualInstallationMethodRequired(
        chatIntegration.toJS(),
        storeIntegration.toJS(),
    )

    const showUpdatePermissionsBanner = useMemo(() => {
        if (
            !storeIntegration ||
            installationMethod !== BundleInstallationMethod.OneClick
        ) {
            return false
        }

        const scopes = storeIntegration?.getIn(['meta', 'oauth', 'scope']) as
            | List<string>
            | undefined

        return (
            !scopes?.includes('write_script_tags') ||
            !scopes?.includes('read_script_tags')
        )
    }, [installationMethod, storeIntegration])

    const isSubmitDisabled = useMemo(() => {
        return showUpdatePermissionsBanner || !integrationId
    }, [showUpdatePermissionsBanner, integrationId])

    useEffect(() => {
        setInstallationMethod(
            isManualMethodRequired
                ? BundleInstallationMethod.Manual
                : BundleInstallationMethod.OneClick,
        )
    }, [isManualMethodRequired])

    const { isSubmitting, installBundle } = useInstallBundle(
        integrationId,
        installationMethod,
    )

    return isLoading ? (
        <Loader message="Loading..." minHeight={'400px'} />
    ) : (
        <div className="full-width">
            {renderHeader && <PageHeader title="Installation" />}
            <Container fluid className={css.pageContainer}>
                <div className={css.content}>
                    {isInstalled ? (
                        <ConvertBundleDetail
                            storeIntegration={storeIntegration}
                            chatIntegration={chatIntegration}
                            bundle={bundle}
                            isConnectedToShopify={isConnectedToShopify}
                            isThemeAppExtensionInstallation={
                                shouldUseThemeAppExtensionInstallation
                            }
                        />
                    ) : (
                        <>
                            <div className={css.section}>
                                <div className={css.sectionHeading}>
                                    Select installation method for the Campaign
                                    bundle
                                </div>
                                <div>
                                    <p>
                                        The Campaign bundle is a special code
                                        that allows the campaigns to appear on
                                        your store. The installation process is
                                        similar to the chat installation.
                                    </p>
                                </div>
                                <div className={css.radioButtonGroup}>
                                    {!shouldUseThemeAppExtensionInstallation && (
                                        <PreviewRadioButton
                                            value="one-click"
                                            isSelected={
                                                installationMethod ===
                                                BundleInstallationMethod.OneClick
                                            }
                                            isDisabled={isManualMethodRequired}
                                            label="1-click install"
                                            caption="for Shopify stores (except headless)"
                                            onClick={() => {
                                                setInstallationMethod(
                                                    BundleInstallationMethod.OneClick,
                                                )
                                            }}
                                        />
                                    )}
                                    <PreviewRadioButton
                                        value="manual"
                                        isSelected={
                                            installationMethod ===
                                            BundleInstallationMethod.Manual
                                        }
                                        label="Manual install"
                                        caption="for Shopify headless stores, Woocommerce, BigCommerce, Magento stores or custom websites"
                                        onClick={() => {
                                            setInstallationMethod(
                                                BundleInstallationMethod.Manual,
                                            )
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <Button
                                    onClick={installBundle}
                                    isLoading={isSubmitting}
                                    isDisabled={isSubmitDisabled}
                                >
                                    {installationMethod ===
                                    BundleInstallationMethod.OneClick
                                        ? 'Install'
                                        : 'Install manually'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Container>
        </div>
    )
}

export default ConvertBundleView
