import React, {useEffect, useMemo, useState} from 'react'
import {Container} from 'reactstrap'
import {useParams} from 'react-router-dom'
import {useQueryClient} from '@tanstack/react-query'
import {List} from 'immutable'
import PageHeader from 'pages/common/components/PageHeader'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationById} from 'state/integrations/selectors'
import {GORGIAS_CHAT_INTEGRATION_TYPE} from 'constants/integration'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {bundleKeys, useListBundles} from 'models/convert/bundle/queries'
import {
    RevenueBundleActionResponse,
    RevenueBundleInstallationMethod,
} from 'models/revenueBundles/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import client from 'models/api/resources'
import useAppDispatch from 'hooks/useAppDispatch'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import Button from 'pages/common/components/button/Button'
import {IntegrationType} from 'models/integration/constants'
import useAsyncFn from 'hooks/useAsyncFn'
import {transformBundleError} from 'pages/settings/revenue/utils/transformBundleError'
import Loader from 'pages/common/components/Loader/Loader'
import ConvertBundleDetail from '../ConvertBundleDetail'
import css from './ConvertBundleView.less'

const ConvertBundleView = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: paramIntegrationId} =
        useParams<ConvertRouteParams>()

    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

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

    const {data: bundles, isLoading} = useListBundles({
        enabled: !!storeIntegrationId || !!chatIntegrationId,
    })

    const bundle = useMemo(() => {
        if (!bundles || !Array.isArray(bundles)) return undefined

        return bundles.find((bundle) => {
            return (
                bundle.shop_integration_id === storeIntegrationId ||
                bundle.shop_integration_id === chatIntegrationId
            )
        })
    }, [bundles, storeIntegrationId, chatIntegrationId])

    const isInstalled = useMemo(
        () => !!bundle && bundle.status === 'installed',
        [bundle]
    )

    // install
    const [installationMethod, setInstallationMethod] =
        useState<RevenueBundleInstallationMethod>(
            RevenueBundleInstallationMethod.OneClick
        )

    const isManualMethodRequired = useMemo(() => {
        return (
            storeIntegration &&
            storeIntegration.get('type') !== IntegrationType.Shopify
        )
    }, [storeIntegration])

    const showUpdatePermissionsBanner = useMemo(() => {
        if (
            !storeIntegration ||
            installationMethod === RevenueBundleInstallationMethod.Manual
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
            await client.post<RevenueBundleActionResponse>(
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

            await queryClient.invalidateQueries({
                queryKey: bundleKeys.lists(),
            })
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
                                            RevenueBundleInstallationMethod.OneClick
                                        }
                                        isDisabled={isManualMethodRequired}
                                        label="1-click install"
                                        caption="for Shopify stores (except headless)"
                                        onClick={() => {
                                            setInstallationMethod(
                                                RevenueBundleInstallationMethod.OneClick
                                            )
                                        }}
                                    />
                                    <PreviewRadioButton
                                        value="manual"
                                        isSelected={
                                            installationMethod ===
                                            RevenueBundleInstallationMethod.Manual
                                        }
                                        label="Manual install"
                                        caption="for Shopify headless stores, Woocommerce, BigCommerce, Magento stores or custom websites"
                                        onClick={() => {
                                            setInstallationMethod(
                                                RevenueBundleInstallationMethod.Manual
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
                                    RevenueBundleInstallationMethod.OneClick
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
