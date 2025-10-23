import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { history } from '@repo/routing'
import { useQueryClient } from '@tanstack/react-query'
import classnames from 'classnames'
import { useLocation, useParams } from 'react-router-dom'
import { Col, Container, Row } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import { bundleKeys } from 'models/convert/bundle/queries'
import { BundleStatus } from 'models/convert/bundle/types'
import { IntegrationType } from 'models/integration/constants'
import PageHeader from 'pages/common/components/PageHeader'
import {
    NavigatedSuccessModalLocationState,
    NavigatedSuccessModalName,
} from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import ConvertInstallModal from 'pages/convert/bundles/components/ConvertInstallModal'
import { useGetConvertBundle } from 'pages/convert/bundles/hooks/useGetConvertBundle'
import { useUpdateChannelConnection } from 'pages/convert/channelConnections/hooks/useUpdateChannelConnection'
import { CONVERT_ROUTE_PARAM_NAME } from 'pages/convert/common/constants'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import { ConvertRouteParams } from 'pages/convert/common/types'
import { useBackToConvert } from 'pages/convert/onboarding/hooks/useBackToConvert'
import {
    getIntegrationById,
    getIntegrationsByType,
} from 'state/integrations/selectors'
import { assetsUrl, toJS } from 'utils'

import ConvertOnboardingStep from '../ConvertOnboardingStep'

import css from './ConvertOnboardingView.less'

const BOOK_CALL_URL =
    'https://calendly.com/d/crqk-wt9-6cs/gorgias-convert-onboarding-kick-off?utm_medium=in_product&utm_source=helpdesk&utm_campaign=onboarding_flow'

const ConvertOnboardingView = () => {
    const { [CONVERT_ROUTE_PARAM_NAME]: integrationId } =
        useParams<ConvertRouteParams>()

    const queryClient = useQueryClient()
    const location = useLocation()

    const chatIntegrationId = parseInt(integrationId || '')
    const chatIntegration = useAppSelector(
        getIntegrationById(chatIntegrationId),
    )

    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Shopify),
    )

    const { setBackIntegrationId } = useBackToConvert()

    const hasChat = useMemo(
        () =>
            Boolean(
                chatIntegration &&
                    chatIntegration.get('type') ===
                        GORGIAS_CHAT_INTEGRATION_TYPE,
            ),
        [chatIntegration],
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
        getIntegrationById(storeIntegrationId),
    )

    const hasStore = useMemo(
        () =>
            Boolean(
                storeIntegration &&
                    storeIntegration.get('type') === SHOPIFY_INTEGRATION_TYPE,
            ),
        [storeIntegration],
    )

    const { channelConnection } = useGetOrCreateChannelConnection(
        toJS(chatIntegration),
    )

    const [isOnboarded, isSetup] = useMemo(() => {
        return [
            !!channelConnection && (channelConnection.is_onboarded ?? false),
            !!channelConnection && (channelConnection.is_setup ?? false),
        ]
    }, [channelConnection])

    const { bundle } = useGetConvertBundle(
        storeIntegrationId,
        chatIntegrationId,
    )

    const isInstalled = useMemo(
        () => !!bundle && bundle.status === BundleStatus.Installed,
        [bundle],
    )

    const isSubscriber = useIsConvertSubscriber()

    const updateChannelConnection = useUpdateChannelConnection()

    const handleGetStarted = useCallback(async () => {
        if (updateChannelConnection.isLoading) return

        if (!!channelConnection) {
            const data = isSubscriber
                ? { is_onboarded: true }
                : { is_setup: true }

            await updateChannelConnection.mutateAsync([
                undefined,
                { channel_connection_id: channelConnection.id },
                data,
            ])
        }
    }, [channelConnection, isSubscriber, updateChannelConnection])

    useEffect(() => {
        // Once onboarding is done, redirect user to campaigns
        if ((!isSubscriber && isSetup) || (isSubscriber && isOnboarded)) {
            const locationState: NavigatedSuccessModalLocationState = {
                showModal: NavigatedSuccessModalName.ConvertOnboarding,
            }
            history.push(
                `/app/convert/${chatIntegrationId}/campaigns`,
                locationState,
            )
        }
    }, [chatIntegrationId, isSubscriber, isOnboarded, isSetup])

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
                        css.pageWrapper,
                    )}
                >
                    <Col
                        xs={12}
                        lg={7}
                        xl={7}
                        className={classnames(
                            css.content,
                            'mt-sm-5',
                            'mt-lg-0',
                        )}
                    >
                        {isSubscriber && (!hasChat || hasStore) ? (
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
                                    onClick={() => {
                                        setBackIntegrationId(chatIntegrationId)
                                    }}
                                    isDisabled={false}
                                    isCompleted={hasStore}
                                />

                                <ConvertOnboardingStep
                                    number={2}
                                    title="Add Chat"
                                    description="Add Chat to display campaigns on your website."
                                    action="Add Chat"
                                    actionLink="/app/settings/channels/gorgias_chat/new/create-wizard"
                                    onClick={() =>
                                        setBackIntegrationId(chatIntegrationId)
                                    }
                                    isDisabled={!hasStore}
                                    isCompleted={hasChat}
                                />

                                <ConvertOnboardingStep
                                    number={3}
                                    title="Create your first campaigns"
                                    description="Create and launch your first campaign."
                                    action="Create Campaign"
                                    actionLink={`/app/convert/${chatIntegrationId}/setup/wizard`}
                                    isDisabled={!hasChat}
                                    isCompleted={isOnboarded}
                                />

                                {location.hash === '#later' && (
                                    <p className={classnames(css.text, 'mt-3')}>
                                        Need more help to set up Convert?{' '}
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={BOOK_CALL_URL}
                                        >
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
                                    onClick={() =>
                                        setBackIntegrationId(chatIntegrationId)
                                    }
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
                            'px-5',
                            'py-4',
                            'mt-sm-5',
                            'mt-lg-0',
                        )}
                    >
                        {isSubscriber ? (
                            <img
                                src={assetsUrl(
                                    '/img/presentationals/convert-campaign.png',
                                )}
                                className={css.forSubscribers}
                                alt="Convert campaign preview"
                            />
                        ) : (
                            <img
                                src={assetsUrl(
                                    '/img/presentationals/convert-basic-campaign.png',
                                )}
                                alt="Convert campaign preview"
                            />
                        )}
                    </Col>
                </Row>
            </Container>
            <ConvertInstallModal
                isOpen={isInstallOpen}
                isConnectedToShopify={hasStore}
                integration={hasStore ? storeIntegration : chatIntegration}
                chatIntegration={chatIntegration}
                onSubmit={handleInstallChange}
                onClose={handleInstallChange}
            />
        </div>
    )
}

export default ConvertOnboardingView
