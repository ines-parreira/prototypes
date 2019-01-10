import React from 'react'
import PropTypes from 'prop-types'
import {Link} from 'react-router'
import {Card, CardBody, Button} from 'reactstrap'

import * as segmentTracker from '../../../../store/middlewares/segmentTracker'

const InfobarAddIntegrationSuggestion = ({customer}) => (
    <div className="widgets-list">
        <div>
            <Card className="wrapper transparent">
                <CardBody className="content">
                    <div>
                        <Card className="blurred">
                            <CardBody className="header clearfix">
                                <span>
                                    👤 {customer.get('name') || 'Nadia'} - 4 orders
                                </span>
                            </CardBody>
                            <CardBody className="content">
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
                            </CardBody>
                        </Card>
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
                                to="/app/settings/integrations"
                                onClick={() => {
                                    segmentTracker.logEvent(segmentTracker.EVENTS.INFOBAR_INTEGRATION_ADD_CLICKED)
                                }}
                            >
                                Add integration
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    </div>
)

InfobarAddIntegrationSuggestion.propTypes = {
    customer: PropTypes.object.isRequired,
}

export default InfobarAddIntegrationSuggestion
