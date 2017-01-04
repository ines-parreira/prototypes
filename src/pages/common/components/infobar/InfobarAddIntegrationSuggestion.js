import React from 'react'
import {Link} from 'react-router'
import {logEvent} from '../../../../store/middlewares/amplitudeTracker'

const InfobarAddIntegrationSuggestion = () => (
    <div className="widgets-list">
        <div>
            <div className="ui card wrapper">
                <div className="content">
                    <div>
                        <div className="ui card blurred">
                            <div className="content">
                                <div className="header clearfix">
                                    👤 Nadia - 4 orders
                                </div>
                                <div>
                                    <div className="simple-field">
                                        <span className="field-label">Spent:</span>
                                        <span className="field-value">$71</span>
                                    </div>
                                    <div className="simple-field">
                                        <span className="field-label">Lifetime value:</span>
                                        <span className="field-value">$252</span>
                                    </div>
                                    <div className="simple-field">
                                        <span className="field-label">Points:</span>
                                        <span className="field-value">153</span>
                                    </div>
                                    <div className="simple-field">
                                        <span className="field-label">Group:</span>
                                        <span className="field-value">VIP</span>
                                    </div>
                                    <div className="simple-field">
                                        <span className="field-label">Birthday:</span>
                                        <span className="field-value">03/08/1991</span>
                                    </div>
                                    <div className="simple-field">
                                        <span className="field-label">Address:</span>
                                        <span className="field-value">768 Harrison St, San Francisco, 94107, CA</span>
                                    </div>
                                    <div className="simple-field">
                                        <span className="field-label">Created at:</span>
                                        <span className="field-value">12/10/2016</span>
                                    </div>
                                    <div className="simple-field">
                                        <span className="field-label">Preferred communication:</span>
                                        <span className="field-value">email</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="no-result-container suggestion">
                            <h3>Display customer data here<br />by adding an integration</h3>
                            <Link
                                to="/app/integrations/http"
                                className="ui small light blue button"
                                onClick={() => logEvent('Clicked add integration on add integration widget')}
                            >
                                Add integration
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

export default InfobarAddIntegrationSuggestion
