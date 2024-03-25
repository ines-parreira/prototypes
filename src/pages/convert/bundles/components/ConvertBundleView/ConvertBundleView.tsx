import React, {useEffect, useMemo, useState} from 'react'
import {Container} from 'reactstrap'
import {useParams} from 'react-router-dom'
import {List} from 'immutable'
import PageHeader from 'pages/common/components/PageHeader'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationById} from 'state/integrations/selectors'
import {GORGIAS_CHAT_INTEGRATION_TYPE} from 'constants/integration'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import Button from 'pages/common/components/button/Button'
import {IntegrationType} from 'models/integration/constants'
import Loader from 'pages/common/components/Loader/Loader'
import {useInstallBundle} from 'pages/convert/bundles/hooks/useInstallBundle'
import {useGetConvertBundle} from 'pages/convert/bundles/hooks/useGetConvertBundle'
import {
    BundleInstallationMethod,
    BundleStatus,
} from 'models/convert/bundle/types'
import ConvertBundleDetail from '../ConvertBundleDetail'
import css from './ConvertBundleView.less'

const ConvertBundleView = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: paramIntegrationId} =
        useParams<ConvertRouteParams>()

    const chatIntegrationId = parseInt(paramIntegrationId || '')
    const chatIntegration = useAppSelector(
        getIntegrationById(chatIntegrationId)
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
        getIntegrationById(storeIntegrationId)
    )

    const integrationId = useMemo(
        () =>
            Boolean(storeIntegrationId)
                ? storeIntegrationId
                : chatIntegrationId,
        [storeIntegrationId, chatIntegrationId]
    )

    const {bundle, isLoading} = useGetConvertBundle(
        storeIntegrationId,
        chatIntegrationId
    )

    const isInstalled = useMemo(
        () => !!bundle && bundle.status === BundleStatus.Installed,
        [bundle]
    )

    // install
    const [installationMethod, setInstallationMethod] =
        useState<BundleInstallationMethod>(BundleInstallationMethod.OneClick)

    const isManualMethodRequired = useMemo(() => {
        return (
            storeIntegration &&
            storeIntegration.get('type') !== IntegrationType.Shopify
        )
    }, [storeIntegration])

    const showUpdatePermissionsBanner = useMemo(() => {
        if (
            !storeIntegration ||
            installationMethod === BundleInstallationMethod.Manual
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
                : BundleInstallationMethod.OneClick
        )
    }, [isManualMethodRequired])

    const {isSubmitting, installBundle} = useInstallBundle(
        integrationId,
        installationMethod
    )

    return isLoading ? (
        <Loader message="Loading..." minHeight={'400px'} />
    ) : (
        <div className="full-width">
            <PageHeader title="Installation" />
            <Container fluid className={css.pageContainer}>
                <div className={css.content}>
                    {isInstalled ? (
                        <ConvertBundleDetail
                            storeIntegration={storeIntegration}
                            chatIntegration={chatIntegration}
                            bundle={bundle}
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
                                                BundleInstallationMethod.OneClick
                                            )
                                        }}
                                    />
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
                                                BundleInstallationMethod.Manual
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
