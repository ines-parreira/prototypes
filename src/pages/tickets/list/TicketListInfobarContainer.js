// @flow
import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import classnames from 'classnames'
import moment from 'moment'

import {isAdmin} from '../../../utils'

import InfobarLayout from '../../common/components/infobar/InfobarLayout'

import * as integrationsSelectors from '../../../state/integrations/selectors'
import * as currentUserSelectors from '../../../state/currentUser/selectors'
import * as agentSelectors from '../../../state/agents/selectors'

import * as segmentTracker from '../../../store/middlewares/segmentTracker'

import css from './TicketListInfobarContainer.less'

import type {Map, List} from 'immutable'
import Video from '../../common/components/Video'

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
    agents: List<*>,
    currentUser: Map<*, *>,
    emailIntegrations: List<*>,
    hasIntegrationsOfTypes: typeof integrationsSelectors.hasIntegrationOfTypes,
}

class TicketListInfobarContainer extends React.Component<Props> {

    _hideBoarding = () => {
        window.localStorage.setItem('hideBoarding', true)
        this.forceUpdate()
    }

    render() {
        const {agents, currentUser, emailIntegrations, hasIntegrationsOfTypes} = this.props

        const hasVerifiedEmailIntegration = emailIntegrations
            .filter((integration) => !integration.getIn(['meta', 'address']).endsWith('.gorgias.io')) // remove generated gorgias addresses
            .some((integration) => {
                // gmail is connected or forwarding is on
                return integration.get('type') === 'gmail' || integration.getIn(['meta', 'verified'])
            })

        const hasConnectedFacebook = hasIntegrationsOfTypes('facebook')
        const hasShopifyIntegration = hasIntegrationsOfTypes('shopify')

        const hasConnectedChat = hasIntegrationsOfTypes(['smooch', 'smooch_inside'])

        const hasInvitedTeamMembers = agents.size > 1

        const hidingDate = moment(currentUser.get('created_datetime')).add(10, 'days')

        const shouldHide = !isAdmin(currentUser)
            || window.localStorage.getItem('hideBoarding')
            || moment().isAfter(hidingDate)

        if (shouldHide) {
            return null
        }

        return (
            <InfobarLayout>
                <div
                    className={classnames(css.page, 'infobar-content')}
                >
                    <h1>
                        Welcome<br/>
                        {currentUser.get('firstname')}!
                    </h1>

                    <p>
                        Follow these steps to get started:
                    </p>

                    <div className={css.buttons}>
                        <Link
                            to="/app/settings/integrations/shopify"
                            className={css.button}
                            onClick={() => {
                                segmentTracker.logEvent(segmentTracker.EVENTS.ONBOARDING_WIDGET_CLICKED, {
                                    name: 'Connect a Shopify store',
                                })
                            }}
                        >
                            {/* $FlowFixMe */}
                            <CheckIcon condition={hasShopifyIntegration}/>
                            <div>Connect Shopify</div>
                        </Link>
                        <Link
                            to="/app/settings/integrations/email"
                            className={css.button}
                            onClick={() => {
                                segmentTracker.logEvent(segmentTracker.EVENTS.ONBOARDING_WIDGET_CLICKED, {
                                    name: 'Connect an email address',
                                })
                            }}
                        >
                            <CheckIcon condition={hasVerifiedEmailIntegration}/>
                            <div>Connect email</div>
                        </Link>
                        <Link
                            to="/app/settings/integrations/smooch_inside"
                            className={css.button}
                            onClick={() => {
                                segmentTracker.logEvent(segmentTracker.EVENTS.ONBOARDING_WIDGET_CLICKED, {
                                    name: 'Connect chat',
                                })
                            }}
                        >
                            {/* $FlowFixMe */}
                            <CheckIcon condition={hasConnectedChat}/>
                            <div>Connect live chat</div>
                        </Link>
                        <Link
                            to="/app/settings/integrations/facebook"
                            className={css.button}
                            onClick={() => {
                                segmentTracker.logEvent(segmentTracker.EVENTS.ONBOARDING_WIDGET_CLICKED, {
                                    name: 'Connect Facebook',
                                })
                            }}
                        >
                            {/* $FlowFixMe */}
                            <CheckIcon condition={hasConnectedFacebook}/>
                            <div>Connect Facebook &amp; Instagram</div>
                        </Link>
                        <Link
                            to="/app/settings/team"
                            className={css.button}
                            onClick={() => {
                                segmentTracker.logEvent(segmentTracker.EVENTS.ONBOARDING_WIDGET_CLICKED, {
                                    name: 'Add team members',
                                })
                            }}
                        >
                            <CheckIcon condition={hasInvitedTeamMembers}/>
                            <div>Add team members</div>
                        </Link>
                    </div>

                    <div className="mt-5 text-info">
                        <h5>Learn how to use Gorgias:</h5>
                        <Video
                            videoId="dNWQPHfCtmE"
                            legend="How to use Gorgias"
                        />
                    </div>

                    <a
                        className={css.bottom}
                        onClick={this._hideBoarding}
                    >
                        Hide
                    </a>
                </div>
            </InfobarLayout>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        agents: agentSelectors.getAgents(state),
        currentUser: currentUserSelectors.getCurrentUser(state),
        emailIntegrations: integrationsSelectors.getEmailIntegrations(state),
        hasIntegrationsOfTypes: integrationsSelectors.makeHasIntegrationOfTypes(state),
    }
}

export default connect(mapStateToProps)(TicketListInfobarContainer)
