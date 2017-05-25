import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {isAdmin} from '../../../utils'
import moment from 'moment'

import {ONBOARDING_INTEGRATION_SUGGESTIONS} from '../../../config'
import InfobarLayout from '../../common/components/infobar/InfobarLayout'

import * as integrationsSelectors from '../../../state/integrations/selectors'
import * as currentUserSelectors from '../../../state/currentUser/selectors'

import {logEvent} from '../../../store/middlewares/amplitudeTracker'
import {getIconFromType} from '../../../state/integrations/helpers'

import css from './TicketListInfobarContainer.less'

const suggestions = ONBOARDING_INTEGRATION_SUGGESTIONS

class TicketListInfobarContainer extends React.Component {
    static propTypes = {
        currentUser: PropTypes.object.isRequired,
        integrations: PropTypes.object.isRequired,
    }

    _hideBoarding = () => {
        window.localStorage.setItem('hideBoarding', true)
        this.forceUpdate()
    }

    render() {
        const {
            currentUser,
            integrations,
        } = this.props

        const displayedSuggestions = suggestions.filter((suggestion) => {
            // remove suggestions that have already at least an integration
            return !integrations.find(integration => integration.get('type') === suggestion.type)
        })

        const hasShopifyIntegration = integrations.some(integration => integration.get('type') === 'shopify')

        const hidingDate = moment(currentUser.get('created_datetime')).add(14, 'days')

        // hide bar if current user is not an admin
        const shouldHide = !isAdmin(currentUser)
            // or if boarding infobar has been hidden
            || window.localStorage.getItem('hideBoarding')
            // or if there is no suggestions (already added every suggested integrations)
            || !displayedSuggestions.length
            // or if a certain time has passed since user creation AND at least an integration has been made
            || (
                moment().isAfter(hidingDate)
                && displayedSuggestions.length < suggestions.length
            )

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
                    {
                        <div className={css.buttons}>
                            {
                                displayedSuggestions.map((suggestion) => {
                                    const type = suggestion.type

                                    return (
                                        <Link
                                            key={type}
                                            className={css.button}
                                            to={suggestion.url}
                                            onClick={() => {
                                                logEvent(`Clicked add a "${type}" integration on Onboarding widget`)
                                            }}
                                        >
                                            <img
                                                role="presentation"
                                                className="logo"
                                                src={getIconFromType(type)}
                                            />
                                            <span>{suggestion.title}</span>
                                        </Link>
                                    )
                                })
                            }
                            {
                                hasShopifyIntegration && (
                                    <a
                                        href="https://gorgias.helpdocs.io/integrations/http-integrations#Shipstation"
                                        target="_blank"
                                        className={css.button}
                                        onClick={() => {
                                            logEvent('Clicked add a "shipstation" integration on Onboarding widget')
                                        }}
                                    >
                                        <img
                                            role="presentation"
                                            className="logo"
                                            src={`${window.GORGIAS_ASSETS_URL || ''}/static/private/img/integrations/shipstation.png`}
                                        />
                                        <span>Add Shipstation</span>
                                    </a>
                                )
                            }
                            <a
                                href="https://gorgias.helpdocs.io/integrations/helpdocs"
                                target="_blank"
                                className={css.button}
                                onClick={() => {
                                    logEvent('Clicked add a "helpdocs" integration on Onboarding widget')
                                }}
                            >
                                <img
                                    role="presentation"
                                    className="logo"
                                    src={`${window.GORGIAS_ASSETS_URL || ''}/static/private/img/integrations/helpdocs.png`}
                                />
                                <span>Add helpcenter</span>
                            </a>
                        </div>
                    }

                    <Link
                        className={css.sub}
                        to="/app/integrations"
                        onClick={() => {
                            logEvent('Clicked add "other apps" on Onboarding widget')
                        }}
                    >
                        Connect other apps
                    </Link>
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
        integrations: integrationsSelectors.getIntegrations(state),
        currentUser: currentUserSelectors.getCurrentUser(state),
    }
}

export default connect(mapStateToProps)(TicketListInfobarContainer)
