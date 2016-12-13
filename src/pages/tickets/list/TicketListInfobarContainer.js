import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import classnames from 'classnames'
import _pick from 'lodash/pick'
import {isAdmin} from '../../../utils'
import moment from 'moment'

import InfobarLayout from '../../common/components/infobar/InfobarLayout'

import {getAgents} from '../../../state/users/selectors'

class TicketListInfobarContainer extends React.Component {
    _hideBoarding = () => {
        window.localStorage.setItem('hideBoarding', true)
        this.forceUpdate()
    }

    render() {
        const {
            currentUser,
            steps,
            isBoardingDone,
        } = this.props
        let {shouldDisplay} = this.props

        // local storage condition is in render so that it updates on forceUpdate
        shouldDisplay = shouldDisplay
            && !window.localStorage.getItem('hideBoarding')

        if (!shouldDisplay) {
            return null
        }

        return (
            <InfobarLayout>
                <div
                    className="infobar-content flex flex-center flex-column"
                    style={{textAlign: 'center'}}
                >
                    <div style={{fontSize: 100, marginBottom: 60}}>✌️</div>
                    <h1>
                        Welcome to Gorgias <br />
                        {currentUser.get('firstname')}!
                    </h1>
                    {
                        isBoardingDone ? (
                            <div>
                                <h3>You're all set, enjoy ;)</h3>
                                <div>
                                    <button
                                        className="mini ui green button"
                                        onClick={this._hideBoarding}
                                    >
                                        Got it
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3>Let's complete your setup:</h3>
                                <div className="boarding">
                                    {
                                        steps.map((step, index) => {
                                            const linkProperties = _pick(step, [
                                                'href',
                                                'target',
                                                'onClick',
                                            ])

                                            return (
                                                <a
                                                    className={classnames('step', {
                                                        done: step.isDone
                                                    })}
                                                    key={index}
                                                    {...linkProperties}
                                                >
                                                    <i className="check circle icon" />
                                                    {step.title}
                                                </a>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </InfobarLayout>
        )
    }
}

TicketListInfobarContainer.propTypes = {
    currentUser: PropTypes.object.isRequired,
    shouldDisplay: PropTypes.bool.isRequired,
    isBoardingDone: PropTypes.bool.isRequired,
    steps: PropTypes.array.isRequired,
}

const mapStateToProps = (state) => {
    const hasIntegrations = !state.integrations.get('integrations', fromJS([])).isEmpty()
    const hasOtherAgents = getAgents(state).size > 1
    const currentUser = state.currentUser

    // display the bar only for 3 days after user creation (if it is an admin)
    const durationBeforeHide = moment(currentUser.get('created_datetime')).add(3, 'days')

    const steps = [
        {
            title: 'Add your support inbox',
            isDone: true,
            href: 'http://help.gorgias.io/en/latest/src/helpdesk/00-getting-started.html#how-to-set-up-email-forwarding',
            target: '_blank',
            onClick: () => amplitude.getInstance().logEvent('Clicked add support inbox on Onboarding widget'),
        },
        {
            title: 'Invite team members',
            isDone: hasOtherAgents,
            href: '/app/users',
            onClick: () => amplitude.getInstance().logEvent('Clicked invite team members on Onboarding widget'),
        },
        {
            title: 'Add an integration',
            isDone: hasIntegrations,
            href: '/app/integrations',
            onClick: () => amplitude.getInstance().logEvent('Clicked add an integration on Onboarding widget'),
        },
    ]

    const shouldDisplay = isAdmin(currentUser)
        && durationBeforeHide.isAfter(moment())

    return {
        currentUser,
        shouldDisplay,
        isBoardingDone: steps.every(step => step.isDone),
        steps,
    }
}

export default connect(mapStateToProps)(TicketListInfobarContainer)
