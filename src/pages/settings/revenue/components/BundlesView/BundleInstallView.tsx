import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import React, {useMemo, useState} from 'react'

import {Link} from 'react-router-dom'
import classnames from 'classnames'

import {List, Map} from 'immutable'
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
import useAsyncFn from 'hooks/useAsyncFn'

import client from 'models/api/resources'
import history from 'pages/history'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import warningIcon from 'assets/img/icons/warning.svg'
import {transformBundleError} from '../../utils/transformBundleError'
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

    const currentStoreIntegrationId = useMemo((): number | null => {
        if (!currentStoreIntegration) {
            return null
        }
        return currentStoreIntegration?.get('id') as number
    }, [currentStoreIntegration])

    const showUpdatePermissionsBanner = useMemo(() => {
        if (
            !currentStoreIntegration ||
            currentInstallationMethod === RevenueBundleInstallationMethod.Manual
        ) {
            return false
        }

        const scopes = currentStoreIntegration?.getIn([
            'meta',
            'oauth',
            'scope',
        ]) as List<string> | undefined

        return (
            !scopes?.includes('write_script_tags') ||
            !scopes?.includes('read_script_tags')
        )
    }, [currentInstallationMethod, currentStoreIntegration])

    const [{loading: isSubmitting}, installBundle] = useAsyncFn(async () => {
        setHasStoreError(!currentStoreIntegration)
        if (!currentStoreIntegrationId) {
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
                    integration_id: currentStoreIntegrationId,
                }
            )

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Bundle installed successfully',
                })
            )

            history.push(`/app/settings/convert/installations/${data.id}`)
        } catch (e) {
            void dispatch(
                notify(
                    transformBundleError(
                        e,
                        "We couldn't install the bundle. Please try again.",
                        currentStoreIntegrationId
                    )
                )
            )
        }
    }, [
        currentInstallationMethod,
        currentStoreIntegration,
        currentStoreIntegrationId,
    ])

    return (
        <div className="w-100">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to={`/app/settings/convert/installations`}>
                                Convert installations
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
                            Connect a store to use Convert tracking features.
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
                            storeIntegrationId={currentStoreIntegrationId}
                        />
                        {hasStoreError && (
                            <div className={pageCss.error}>
                                This field is required.
                            </div>
                        )}
                        {showUpdatePermissionsBanner &&
                            currentStoreIntegrationId && (
                                <Alert
                                    className="mt-4"
                                    type={AlertType.Warning}
                                >
                                    <p className={pageCss.alertText}>
                                        <img
                                            src={warningIcon}
                                            alt="icon"
                                            className={pageCss.alertBannerIcon}
                                        />
                                        <b>
                                            Update Shopify app permissions to
                                            use 1-click installation
                                        </b>
                                    </p>
                                    <p>
                                        Please go to the{' '}
                                        <Link
                                            to={`/app/settings/integrations/shopify/${currentStoreIntegrationId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Shopify integration settings page
                                        </Link>{' '}
                                        and click <b>Update App Permissions</b>.
                                    </p>
                                </Alert>
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
                            isDisabled={showUpdatePermissionsBanner}
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
