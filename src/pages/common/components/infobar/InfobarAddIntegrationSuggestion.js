import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {Button} from 'reactstrap'

import {logEvent} from '../../../../store/middlewares/amplitudeTracker'

const InfobarAddIntegrationSuggestion = ({user}) => (
    <div className="widgets-list">
        <div>
            <div className="ui card wrapper transparent">
                <div className="content">
                    <div>
                        <div className="ui card blurred">
                            <div className="title header clearfix">
                                <span>
                                    👤 {user.get('name') || 'Nadia'} - 4 orders
                                </span>
                            </div>
                            <div className="content">
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
                                        <span className="field-value">
                                            768 Harrison St, San Francisco, 94107, CA
                                        </span>
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
                            <div
                                className="mb-3"
                                style={{
                                    margin: '0 18px',
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                }}
                            >
                                Display customer data here by adding an integration
                            </div>
                            <Button
                                tag={Link}
                                color="info"
                                to="/app/integrations"
                                onClick={() => logEvent('Clicked add integration on add integration widget')}
                            >
                                Add integration
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

InfobarAddIntegrationSuggestion.propTypes = {
    user: PropTypes.object.isRequired,
}

export default InfobarAddIntegrationSuggestion
