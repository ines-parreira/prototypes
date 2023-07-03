import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import React, {useState} from 'react'

import {Link} from 'react-router-dom'
import classnames from 'classnames'

import {List, Map} from 'immutable'
import {useAsyncFn} from 'react-use'
import css from 'pages/settings/settings.less'

import PageHeader from 'pages/common/components/PageHeader'

import {IntegrationType} from 'models/integration/constants'
import Label from 'pages/common/forms/Label/Label'

import {StoreNameDropdown} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationAppearance/StoreNameDropdown'
import useAppSelector from 'hooks/useAppSelector'
import {DEPRECATED_getIntegrationsByTypes} from 'state/integrations/selectors'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import {
    RevenueBundleActionResponse,
    RevenueBundleInstallationMethod,
} from 'models/revenueBundles/types'
import Button from 'pages/common/components/button/Button'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'

import client from 'models/api/resources'
import history from 'pages/history'
import {useIsRevenueBetaTester} from 'pages/common/hooks/useIsRevenueBetaTester'
import pageCss from './BundlesView.less'

export const BundleInstallView = () => {
    const dispatch = useAppDispatch()

    const allStoreIntegrations = useAppSelector(
        DEPRECATED_getIntegrationsByTypes([IntegrationType.Shopify])
    )

    const storeIntegrations = allStoreIntegrations as List<Map<any, any>>

    const [currentStoreIntegration, setCurrentStoreIntegration] = useState<
        Map<any, any> | false
    >()

    const [currentInstallationMethod, setCurrentInstallationMethod] =
        useState<RevenueBundleInstallationMethod>(
            RevenueBundleInstallationMethod.OneClick
        )

    const [hasStoreError, setHasStoreError] = useState(false)

    const [{loading: isSubmitting}, installBundle] = useAsyncFn(async () => {
        setHasStoreError(!currentStoreIntegration)
        if (!currentStoreIntegration) {
            return
        }

        let action = 'install'
        if (
            currentInstallationMethod === RevenueBundleInstallationMethod.Manual
        ) {
            action = 'manual-install'
        }

        try {
            const {data} = await client.post<RevenueBundleActionResponse>(
                `/api/revenue-addon-bundle/${action}/`,
                {
                    integration_id:
                        currentStoreIntegration &&
                        currentStoreIntegration?.get('id'),
                }
            )

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Bundle installed successfully',
                })
            )

            history.push(`/app/settings/revenue/bundles/${data.id}`)
        } catch (e) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: "Couldn't install bundle",
                })
            )
        }
    }, [currentStoreIntegration])

    const isRevenueSubscriber = useIsRevenueBetaTester()
    if (!isRevenueSubscriber) {
        return (
            <div className={css.pageContainer}>
                You don't have access to this page, please contact your CSM.
            </div>
        )
    }

    return (
        <div className="w-100">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to={`/app/settings/revenue/bundles`}>
                                Bundle management
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Install</BreadcrumbItem>
                    </Breadcrumb>
                }
            ></PageHeader>

            <Container fluid className={classnames(css.pageContainer, css.pb0)}>
                <div className={pageCss.content}>
                    <div className={pageCss.section}>
                        <Label
                            isRequired={true}
                            className={pageCss.sectionHeading}
                        >
                            Connect a store
                        </Label>
                        <div className={pageCss.connectStoreDescription}>
                            Connect a store to use Revenue tracking features.
                        </div>
                        <StoreNameDropdown
                            gorgiasChatIntegrations={
                                [] as unknown as typeof storeIntegrations
                            }
                            storeIntegrations={storeIntegrations}
                            onChange={(storeIntegrationId: number) => {
                                const storeIntegration = storeIntegrations.find(
                                    (storeIntegration) =>
                                        storeIntegration?.get('id') ===
                                        storeIntegrationId
                                )!

                                setCurrentStoreIntegration(storeIntegration)
                            }}
                            hasError={hasStoreError}
                            storeIntegrationId={
                                currentStoreIntegration &&
                                currentStoreIntegration?.get('id')
                            }
                        />
                        {hasStoreError && (
                            <div className={pageCss.error}>
                                This field is required.
                            </div>
                        )}
                    </div>
                    <div className={pageCss.section}>
                        <div className={pageCss.sectionHeading}>
                            Select installation method
                        </div>
                        <div className={pageCss.radioButtonGroup}>
                            <PreviewRadioButton
                                value="one-click"
                                isSelected={
                                    currentInstallationMethod ===
                                    RevenueBundleInstallationMethod.OneClick
                                }
                                label="1-click install"
                                caption="Shopify non headless stores"
                                onClick={() => {
                                    setCurrentInstallationMethod(
                                        RevenueBundleInstallationMethod.OneClick
                                    )
                                }}
                            />
                            <PreviewRadioButton
                                value="manual"
                                isSelected={
                                    currentInstallationMethod ===
                                    RevenueBundleInstallationMethod.Manual
                                }
                                label="Manual install"
                                caption="for headless, knowledge bases, etc."
                                onClick={() => {
                                    setCurrentInstallationMethod(
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
                        >
                            {currentInstallationMethod ===
                            RevenueBundleInstallationMethod.OneClick
                                ? 'Install'
                                : 'Install manually'}
                        </Button>
                    </div>
                </div>
            </Container>
        </div>
    )
}
