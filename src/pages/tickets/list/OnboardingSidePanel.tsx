import classnames from 'classnames'
import {Map} from 'immutable'
import React from 'react'
import {Link} from 'react-router-dom'

import {logEvent, SegmentEvent} from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import InfobarLayout from 'pages/common/components/infobar/InfobarLayout'
import Video from 'pages/common/components/Video/Video'
import {isBaseEmailIntegration} from 'pages/integrations/integration/components/email/helpers'
import {getHumanAgents} from 'state/agents/selectors'
import {is2FAEnforcedSelector} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {
    getEmailIntegrations,
    makeHasIntegrationOfTypes,
} from 'state/integrations/selectors'

import css from './OnboardingSidePanel.less'

const CheckIcon = ({condition}: {condition: boolean}) => (
    <i
        className={classnames('material-icons', {
            'text-success': condition,
            'text-faded': !condition,
        })}
    >
        check_circle
    </i>
)

type Props = {
    isHidden: boolean
    isOnNewLayout?: boolean
    onHide: () => void
}

export default function OnboardingSidePanel({
    isHidden,
    isOnNewLayout,
    onHide,
}: Props) {
    const agents = useAppSelector(getHumanAgents)
    const currentUser = useAppSelector(getCurrentUser)
    const emailIntegrations = useAppSelector(getEmailIntegrations)
    const hasIntegrationsOfTypes = useAppSelector(makeHasIntegrationOfTypes)
    const is2FAEnforced = useAppSelector(is2FAEnforcedSelector)

    const hasVerifiedEmailIntegration = emailIntegrations
        .filter(
            (integration: Map<any, any>) =>
                !isBaseEmailIntegration(integration.toJS())
        ) // remove generated gorgias addresses
        .some((integration: Map<any, any>) => {
            // gmail or outlook is connected or forwarding is on
            return (
                integration.get('type') !== IntegrationType.Email ||
                (integration.getIn(['meta', 'verified']) as boolean)
            )
        })

    const hasConnectedFacebook = hasIntegrationsOfTypes(
        IntegrationType.Facebook
    )
    const hasShopifyIntegration = hasIntegrationsOfTypes(
        IntegrationType.Shopify
    )

    const hasConnectedChat = hasIntegrationsOfTypes([
        IntegrationType.GorgiasChat,
    ])

    const hasInvitedTeamMembers = agents.size > 1

    if (isHidden) {
        return null
    }

    return (
        <InfobarLayout className={css.container} isOnNewLayout={isOnNewLayout}>
            <div className={css.page}>
                <div className={css.content}>
                    <h1>
                        Welcome
                        <br />
                        {currentUser.get('firstname')}!
                    </h1>

                    <p>Get started with these easy steps:</p>

                    <div className={css.buttons}>
                        <Link
                            to="/app/settings/integrations?category=Ecommerce"
                            className={css.button}
                            onClick={() => {
                                logEvent(SegmentEvent.OnboardingWidgetClicked, {
                                    name: 'Connect a store',
                                })
                            }}
                            data-testid="connect-store"
                        >
                            <CheckIcon condition={hasShopifyIntegration} />
                            <div>Connect store</div>
                        </Link>
                        <Link
                            to="/app/settings/channels/email"
                            className={css.button}
                            onClick={() => {
                                logEvent(SegmentEvent.OnboardingWidgetClicked, {
                                    name: 'Connect an email address',
                                })
                            }}
                            data-testid="connect-email"
                        >
                            <CheckIcon
                                condition={hasVerifiedEmailIntegration}
                            />
                            <div>Connect email</div>
                        </Link>
                        <Link
                            to="/app/settings/access"
                            className={css.button}
                            onClick={() => {
                                logEvent(SegmentEvent.OnboardingWidgetClicked, {
                                    name: 'Enable 2FA',
                                })
                            }}
                            data-testid="enable-2FA"
                        >
                            <CheckIcon condition={is2FAEnforced} />
                            <div>Enable 2FA</div>
                        </Link>
                        <Link
                            to="/app/settings/channels/gorgias_chat"
                            className={css.button}
                            onClick={() => {
                                logEvent(SegmentEvent.OnboardingWidgetClicked, {
                                    name: 'Connect chat',
                                })
                            }}
                            data-testid="connect-chat"
                        >
                            <CheckIcon condition={hasConnectedChat} />
                            <div>Add chat widget</div>
                        </Link>
                        <Link
                            to="/app/settings/integrations/facebook"
                            className={css.button}
                            onClick={() => {
                                logEvent(SegmentEvent.OnboardingWidgetClicked, {
                                    name: 'Connect social media',
                                })
                            }}
                            data-testid="connect-social"
                        >
                            <CheckIcon condition={hasConnectedFacebook} />
                            <div>Connect social media</div>
                        </Link>
                        <Link
                            to="/app/settings/users/"
                            className={css.button}
                            onClick={() => {
                                logEvent(SegmentEvent.OnboardingWidgetClicked, {
                                    name: 'Add team members',
                                })
                            }}
                            data-testid="add-team-members"
                        >
                            <CheckIcon condition={hasInvitedTeamMembers} />
                            <div>Invite team members</div>
                        </Link>
                    </div>

                    <div className="mt-5 text-info text-center">
                        <h5>Check out this 1-min video:</h5>
                        <Video
                            legend="Answering a ticket"
                            videoURL="https://fast.wistia.net/embed/iframe/lk7lds8j9m"
                            previewURL="https://embed-ssl.wistia.com/deliveries/1a0d87ab3783e2839426abf3f7d62727.jpg?image_crop_resized=686x298"
                        />
                    </div>
                </div>
                <div className={css.bottom}>
                    <Button
                        className={css.button}
                        fillStyle="ghost"
                        intent="secondary"
                        onClick={onHide}
                        size="medium"
                    >
                        Skip
                    </Button>
                </div>
            </div>
        </InfobarLayout>
    )
}
