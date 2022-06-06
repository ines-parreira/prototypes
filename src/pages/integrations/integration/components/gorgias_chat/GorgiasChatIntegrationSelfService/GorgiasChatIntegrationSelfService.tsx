import React, {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {fromJS, Map} from 'immutable'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {useAsyncFn} from 'react-use'

import PageHeader from 'pages/common/components/PageHeader'
import {DEPRECATED_getIntegrations} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/types'
import {
    createChatHelpCenterConfiguration,
    fetchSelfServiceConfiguration,
    updateChatHelpCenterConfiguration,
} from 'models/selfServiceConfiguration/resources'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getHelpCenterList} from 'state/entities/helpCenter/helpCenters'
import {updateOrCreateIntegration} from 'state/integrations/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import ChatIntegrationNavigation from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationNavigation'
import useAppSelector from 'hooks/useAppSelector'
import {useFeatureFlags} from 'hooks/useFeatureFlags'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {FlagKey} from 'providers/FeatureFlags'

import settingsCss from 'pages/settings/settings.less'

import GorgiasChatIntegrationPreviewContainer from '../GorgiasChatIntegrationPreviewContainer/GorgiasChatIntegrationPreviewContainer'

import SelfService from './components/SelfService'
import FeaturesPreview from './components/FeaturesPreview'
import ArticleRecommendation from './components/ArticleRecommendation'
import {useChatHelpCenterConfiguration} from './hooks'
import {localeToUserLanguage} from './utils/localeToUserLanguage'

type OwnProps = {
    integration: Map<any, any>
}

export function GorgiasChatIntegrationSelfServiceComponent({
    integration,
}: OwnProps) {
    const chatApplicationId: string = integration.getIn(['meta', 'app_id'])
    const {chatHelpCenterConfiguration, setChatHelpCenterConfiguration} =
        useChatHelpCenterConfiguration(chatApplicationId)
    const integrationType: string = integration.get('type')
    const dispatch = useAppDispatch()
    const {getFlag} = useFeatureFlags()

    const helpCenters = useAppSelector(getHelpCenterList)

    const {isLoading} = useHelpCenterList({per_page: 900})

    const shopName: string | undefined | null = integration.getIn([
        'meta',
        'shop_name',
    ])

    const originalSSPEnabled: boolean = useMemo(() => {
        const sspDeactivatedDatetime: string | undefined | null =
            integration.getIn(['meta', 'self_service_deactivated_datetime'])

        return (
            sspDeactivatedDatetime === null ||
            sspDeactivatedDatetime === undefined
        )
    }, [integration])

    const [sspForceDisabled, setSspForceDisabled] = useState(!shopName)
    const [isArticleReccEnabled, setArticleReccEnabled] = useState(true)

    const [{loading: updating}, updateChatSSP] = useAsyncFn(
        async (sspEnabled: boolean) => {
            const oldMeta: Map<any, any> = integration.get('meta')

            const updatePayload = fromJS({
                ...integration.toJS(),
                meta: {
                    ...(oldMeta?.toJS() || {}),
                    self_service_deactivated_datetime: sspEnabled
                        ? null
                        : new Date().toISOString(),
                },
            })

            await dispatch(updateOrCreateIntegration(updatePayload))
        },
        [integration]
    )

    const integrations = useAppSelector(DEPRECATED_getIntegrations)

    const shopifyIntegration: Map<any, any> | undefined = integrations.find(
        (shopifyIntegration: Map<any, any>) => {
            return (
                shopifyIntegration.get('type') === IntegrationType.Shopify &&
                shopName ===
                    shopifyIntegration.getIn(['meta', 'shop_name'], null)
            )
        }
    )

    const [{loading}, fetchGlobalSsp] = useAsyncFn(async () => {
        if (shopifyIntegration !== undefined && shopName) {
            try {
                const shopifyIntegrationId: number =
                    shopifyIntegration.get('id')

                const {deactivated_datetime} =
                    await fetchSelfServiceConfiguration(
                        `${shopifyIntegrationId}`
                    )

                const sspGloballyDeactivated =
                    deactivated_datetime !== null &&
                    deactivated_datetime !== undefined

                setSspForceDisabled(sspGloballyDeactivated || !shopName)
            } catch (e) {
                console.error(e)
            }
        }
    }, [shopifyIntegration, shopName])

    useEffect(() => void fetchGlobalSsp(), [fetchGlobalSsp])

    const handleOnChangeSwitch = () => {
        if (!sspForceDisabled) {
            void updateChatSSP(!originalSSPEnabled)
        }
    }

    const handleSaveArticleRecommendation = async (
        isEnabled: boolean,
        helpCenterId: number
    ) => {
        if (!chatHelpCenterConfiguration) {
            try {
                const response = await createChatHelpCenterConfiguration({
                    helpCenterId,
                    chatApplicationId,
                })
                setChatHelpCenterConfiguration(response)
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message:
                            'Article recommendation activated with success',
                    })
                )
            } catch (err) {
                console.error(err)
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'Failed to activate the article recommendation',
                    })
                )
            }

            return
        }

        try {
            const response = await updateChatHelpCenterConfiguration({
                enabled: isEnabled,
                helpCenterId,
                chatApplicationId,
                id: chatHelpCenterConfiguration?.id,
            })
            setChatHelpCenterConfiguration(response)

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Article recommendation updated with success',
                })
            )
        } catch (err) {
            console.error(err)
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to update the article recommendation',
                })
            )
        }
    }

    const isSwitchDisabled = useMemo(() => {
        return updating || loading || sspForceDisabled
    }, [updating, loading, sspForceDisabled])

    const helpCenterList = useMemo(
        () =>
            helpCenters
                .filter(
                    (helpCenter) => helpCenter.deactivated_datetime === null
                )
                .map((helpCenter) => ({
                    text: helpCenter.name,
                    label: `${helpCenter.name} (${localeToUserLanguage(
                        helpCenter.default_locale.split('-')[0]
                    )})`,
                    value: helpCenter.name,
                    id: helpCenter.id,
                })),
        [helpCenters]
    )

    const selectedHelpCenter = useMemo(
        () =>
            helpCenterList?.find(
                (el) => el.id === chatHelpCenterConfiguration?.help_center_id
            )?.value,
        [helpCenterList, chatHelpCenterConfiguration]
    )

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">
                                Integrations
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/integrations/${integrationType}`}
                            >
                                Chat
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.get('name')}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <ChatIntegrationNavigation integration={integration} />

            {getFlag(FlagKey.SelfServiceArticleRecommendation) ? (
                <GorgiasChatIntegrationPreviewContainer
                    preview={
                        <FeaturesPreview
                            integration={integration.toJS()}
                            isSelfServiceChecked={originalSSPEnabled}
                            isArticleRecommendationChecked={
                                isArticleReccEnabled
                            }
                        />
                    }
                >
                    <>
                        <SelfService
                            isEnabled={originalSSPEnabled}
                            isDisabled={isSwitchDisabled}
                            isForcedDisabled={sspForceDisabled}
                            onChange={handleOnChangeSwitch}
                        />
                        <ArticleRecommendation
                            isLoading={isLoading}
                            helpCenterList={helpCenterList}
                            initialValues={{
                                isEnabled: chatHelpCenterConfiguration?.enabled,
                                selectedHelpCenter,
                            }}
                            onToggleEnabled={setArticleReccEnabled}
                            onSaveChanges={handleSaveArticleRecommendation}
                        />
                    </>
                </GorgiasChatIntegrationPreviewContainer>
            ) : (
                <Container fluid className={settingsCss.pageContainer}>
                    <SelfService
                        isEnabled={originalSSPEnabled}
                        isDisabled={isSwitchDisabled}
                        isForcedDisabled={sspForceDisabled}
                        onChange={handleOnChangeSwitch}
                    />
                </Container>
            )}
        </div>
    )
}

export default GorgiasChatIntegrationSelfServiceComponent
