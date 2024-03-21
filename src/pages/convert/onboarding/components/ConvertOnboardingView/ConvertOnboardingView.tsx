import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Col, Container, Row} from 'reactstrap'
import classnames from 'classnames'
import {useLocation, useParams} from 'react-router-dom'
import {useQueryClient} from '@tanstack/react-query'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import {assetsUrl, toJS} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import {
    getIntegrationById,
    getIntegrationsByType,
} from 'state/integrations/selectors'
import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'

import {bundleKeys, useListBundles} from 'models/convert/bundle/queries'
import history from 'pages/history'
import {IntegrationType} from 'models/integration/constants'
import {useUpdateChannelConnection} from 'pages/convert/channelConnections/hooks/useUpdateChannelConnection'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import ConvertInstallModal from 'pages/convert/bundles/components/ConvertInstallModal'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import ConvertOnboardingStep from '../ConvertOnboardingStep'
import css from './ConvertOnboardingView.less'

const BOOK_CALL_URL =
    'https://calendly.com/gorgias-implementation/convert-implementation?utm_medium=in_product&utm_source=helpdesk&utm_campaign=onboarding_flow'

const ConvertOnboardingView = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: integrationId} =
        useParams<ConvertRouteParams>()

    const queryClient = useQueryClient()
    const location = useLocation()

    const chatIntegrationId = parseInt(integrationId || '')
    const chatIntegration = useAppSelector(
        getIntegrationById(chatIntegrationId)
    )

    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Shopify)
    )

    const hasChat = useMemo(
        () =>
            Boolean(
                chatIntegration &&
                    chatIntegration.get('type') ===
                        GORGIAS_CHAT_INTEGRATION_TYPE
            ),
        [chatIntegration]
    )

    const storeIntegrationId = useMemo(() => {
        if (hasChat) {
            return (
                !!chatIntegration &&
                (chatIntegration.getIn([
                    'meta',
                    'shop_integration_id',
                ]) as number)
            )
        } else if (shopifyIntegrations.length > 0) {
            return shopifyIntegrations[0].id
        }
        return 0
    }, [chatIntegration, hasChat, shopifyIntegrations])

    const storeIntegration = useAppSelector(
        getIntegrationById(storeIntegrationId)
    )

    const hasStore = useMemo(
        () =>
            Boolean(
                storeIntegration &&
                    storeIntegration.get('type') === SHOPIFY_INTEGRATION_TYPE
            ),
        [storeIntegration]
    )

    const {channelConnection} = useGetOrCreateChannelConnection(
        toJS(chatIntegration)
    )

    const {data: bundles} = useListBundles({
        enabled: hasChat || hasStore,
    })

    const [isOnboarded, isSetup] = useMemo(() => {
        return [
            !!channelConnection && (channelConnection.is_onboarded ?? false),
            !!channelConnection && (channelConnection.is_setup ?? false),
        ]
    }, [channelConnection])

    const isInstalled = useMemo(() => {
        if (!bundles || !Array.isArray(bundles)) return false

        const bundle = bundles.find((bundle) => {
            return (
                bundle.shop_integration_id === storeIntegrationId ||
                bundle.shop_integration_id === chatIntegrationId
            )
        })
        return !!bundle && bundle.status === 'installed'
    }, [bundles, storeIntegrationId, chatIntegrationId])

    const isSubscriber = useIsConvertSubscriber()

    const updateChannelConnection = useUpdateChannelConnection()

    const handleGetStarted = useCallback(async () => {
        if (updateChannelConnection.isLoading) return

        if (!!channelConnection) {
            await updateChannelConnection.mutateAsync([
                undefined,
                {channel_connection_id: channelConnection.id},
                {is_setup: true},
            ])
        }
    }, [channelConnection, updateChannelConnection])

    useEffect(() => {
        // Once onboarding is done, redirect user to campaigns
        if (
            (!isSubscriber && isSetup && hasChat && isInstalled) ||
            (isSubscriber && isOnboarded && hasChat && isInstalled && hasStore)
        ) {
            history.push(`/app/convert/${chatIntegrationId}/campaigns`)
        }
    }, [
        chatIntegrationId,
        hasChat,
        hasStore,
        isSubscriber,
        isInstalled,
        isOnboarded,
        isSetup,
    ])

    const [isInstallOpen, setInstallOpen] = useState<boolean>(false)
    const handleInstallChange = useCallback(async () => {
        await queryClient.invalidateQueries({
            queryKey: bundleKeys.lists(),
        })
        setInstallOpen(false)
    }, [queryClient])

    return (
        <div className={classnames('full-width', css.pageWrapper)}>
            <PageHeader title="Convert" />
            <Container
                fluid
                className={classnames(css.pageWrapper, css.limitHeight)}
            >
                <Row
                    className={classnames(
                        'align-items-center',
                        'mx-0',
                        css.pageWrapper
                    )}
                >
                    <Col
                        xs={12}
                        lg={7}
                        xl={7}
                        className={classnames(
                            css.content,
                            'mt-sm-5',
                            'mt-lg-0'
                        )}
                    >
                        {isSubscriber ? (
                            <>
                                <h1>
                                    Welcome to Convert, your onsite revenue
                                    generation tool kit!
                                </h1>
                                <p className={css.text}>
                                    Elevate the shopping experience by launching
                                    personalized campaigns. With Convert, you
                                    can educate customers, suggest products, or
                                    provide exclusive discount codes to your
                                    customers in a non-intrusive way.
                                </p>
                                <p className={classnames(css.text, 'mb-5')}>
                                    Kickstart your journey today to increase
                                    your Conversion Rate in three simple steps.
                                </p>

                                <ConvertOnboardingStep
                                    number={1}
                                    title="Connect a Shopify store to your account"
                                    description="Needed to access your products, discount codes, and customer information."
                                    action="Connect store"
                                    actionLink={
                                        chatIntegrationId
                                            ? `/app/settings/channels/gorgias_chat/${chatIntegrationId}/installation`
                                            : '/app/settings/integrations/shopify/'
                                    }
                                    isDisabled={false}
                                    isCompleted={hasStore}
                                />

                                <ConvertOnboardingStep
                                    number={2}
                                    title="Add Chat"
                                    description="Add Chat to display campaigns on your website."
                                    action="Add Chat"
                                    actionLink="/app/settings/channels/gorgias_chat/new/create-wizard"
                                    isDisabled={!hasStore}
                                    isCompleted={hasChat}
                                />

                                <ConvertOnboardingStep
                                    number={3}
                                    title="Create your first campaigns"
                                    description="Create and launch your first campaign."
                                    action="Create Campaign"
                                    actionLink={`/app/convert/${chatIntegrationId}/setup/recommendations`}
                                    isDisabled={!hasChat}
                                    isCompleted={isOnboarded}
                                />

                                {location.hash === '#later' && (
                                    <p className={classnames(css.text, 'mt-3')}>
                                        Need more help to set up Convert?{' '}
                                        <a href={BOOK_CALL_URL}>
                                            Book an onboarding call
                                        </a>
                                        .
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <h1>Welcome to Convert!</h1>
                                <p className={classnames(css.text, 'mb-5')}>
                                    Start creating campaigns to engage with your
                                    customers and boost your sales. Follow these
                                    two simple steps to get started:
                                </p>

                                <ConvertOnboardingStep
                                    number={1}
                                    title="Add Chat"
                                    description="Add Chat to display campaigns on your website."
                                    action="Add Chat"
                                    actionLink="/app/settings/channels/gorgias_chat/new/create-wizard"
                                    isDisabled={false}
                                    isCompleted={hasChat}
                                />

                                <ConvertOnboardingStep
                                    number={2}
                                    title="Install the campaign bundle"
                                    description="Required to create and display campaigns."
                                    action="Install Bundle"
                                    onClick={() => setInstallOpen(true)}
                                    isDisabled={!hasChat}
                                    isCompleted={isInstalled}
                                />

                                <Button
                                    fillStyle="fill"
                                    intent="primary"
                                    isDisabled={!isInstalled || !hasChat}
                                    isLoading={
                                        updateChannelConnection.isLoading
                                    }
                                    className={'mt-5'}
                                    onClick={handleGetStarted}
                                >
                                    Get started with campaigns
                                </Button>
                            </>
                        )}
                    </Col>
                    <Col
                        xs={12}
                        lg={5}
                        xl={5}
                        className={classnames(
                            css.preview,
                            'px-4',
                            'py-4',
                            'mt-sm-5',
                            'mt-lg-0'
                        )}
                    >
                        <img
                            src={assetsUrl(
                                isSubscriber
                                    ? '/img/presentationals/convert-campaign.png'
                                    : '/img/presentationals/convert-basic-campaign.png'
                            )}
                            alt="Convert campaign preview"
                        />
                    </Col>
                </Row>
            </Container>
            <ConvertInstallModal
                isOpen={isInstallOpen}
                integration={hasStore ? storeIntegration : chatIntegration}
                onSubmit={handleInstallChange}
                onClose={handleInstallChange}
            />
        </div>
    )
}

export default ConvertOnboardingView
