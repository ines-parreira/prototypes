import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import classnames from 'classnames'
import moment from 'moment'

import {isAdmin} from '../../../utils'

import InfobarLayout from '../../common/components/infobar/InfobarLayout'

import * as integrationsSelectors from '../../../state/integrations/selectors'
import * as currentUserSelectors from '../../../state/currentUser/selectors'
import * as usersSelectors from '../../../state/users/selectors'

import {logEvent} from '../../../store/middlewares/amplitudeTracker'

import css from './TicketListInfobarContainer.less'

class TicketListInfobarContainer extends React.Component {
    static propTypes = {
        agents: ImmutablePropTypes.list.isRequired,
        currentUser: ImmutablePropTypes.map.isRequired,
        emailIntegrations: ImmutablePropTypes.list.isRequired,
        hasIntegrationsOfTypes: PropTypes.func.isRequired,
    }

    _hideBoarding = () => {
        window.localStorage.setItem('hideBoarding', true)
        this.forceUpdate()
    }

    render() {
        const {agents, currentUser, emailIntegrations, hasIntegrationsOfTypes} = this.props

        const hasReceivedEmail = emailIntegrations
            .filter(integration => !integration.getIn(['meta', 'address']).endsWith('.gorgias.io')) // remove generated gorgias addresses
            .some(integration => {
                // gmail is connected or forwarding is on
                return integration.get('type') === 'gmail' || integration.getIn(['meta', 'is_forwarding_on'])
            })

        const hasConnectedFacebook = hasIntegrationsOfTypes('facebook')

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
                        Welcome<br />
                        {currentUser.get('firstname')}
                    </h1>

                    <p>
                        Follow these steps to get started:
                    </p>

                    <div className={css.buttons}>
                        <Link
                            to="/app/integrations/email"
                            className={css.button}
                            onClick={() => {
                                logEvent('Clicked "Receive 1st email" on Onboarding widget')
                            }}
                        >
                            <i
                                className={classnames('fa fa-fw fa-check-circle', {
                                    'text-success': hasReceivedEmail,
                                    'text-faded': !hasReceivedEmail,
                                })}
                            />
                            <div>Receive 1st email</div>
                        </Link>
                        <Link
                            to="/app/integrations/smooch_inside"
                            className={css.button}
                            onClick={() => {
                                logEvent('Clicked "Connect a chat" on Onboarding widget')
                            }}
                        >
                            <i
                                className={classnames('fa fa-fw fa-check-circle', {
                                    'text-success': hasConnectedChat,
                                    'text-faded': !hasConnectedChat,
                                })}
                            />
                            <div>Connect a chat</div>
                        </Link>
                        <Link
                            to="/app/integrations/facebook"
                            className={css.button}
                            onClick={() => {
                                logEvent('Clicked "Connect Facebook" on Onboarding widget')
                            }}
                        >
                            <i
                                className={classnames('fa fa-fw fa-check-circle', {
                                    'text-success': hasConnectedFacebook,
                                    'text-faded': !hasConnectedFacebook,
                                })}
                            />
                            <div>Connect Facebook</div>
                        </Link>
                        <Link
                            to="/app/settings/team"
                            className={css.button}
                            onClick={() => {
                                logEvent('Clicked "Add team members" on Onboarding widget')
                            }}
                        >
                            <i
                                className={classnames('fa fa-fw fa-check-circle', {
                                    'text-success': hasInvitedTeamMembers,
                                    'text-faded': !hasInvitedTeamMembers,
                                })}
                            />
                            <div>Add team members</div>
                        </Link>
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
        agents: usersSelectors.getAgents(state),
        currentUser: currentUserSelectors.getCurrentUser(state),
        emailIntegrations: integrationsSelectors.getEmailIntegrations(state),
        hasIntegrationsOfTypes: integrationsSelectors.makeHasIntegrationOfTypes(state),
    }
}

export default connect(mapStateToProps)(TicketListInfobarContainer)
