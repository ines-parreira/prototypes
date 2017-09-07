import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import classname from 'classnames'

import Navbar from '../../common/components/Navbar'

import * as integrationSelectors from './../../../state/integrations/selectors'

@connect((state, props) => {
    return {
        currentIntegration: integrationSelectors.getIntegrationById(props.params.integrationId)(state)
    }
})
export default class IntegrationNavbarContainer extends React.Component {
    static propTypes = {
        params: PropTypes.shape({
            integrationType: PropTypes.string,
            integrationId: PropTypes.string,
            extra: PropTypes.string
        }).isRequired,
        currentIntegration: PropTypes.object
    }

    render() {
        const {
            currentIntegration,
            params: {integrationType, integrationId, extra}
        } = this.props

        return (
            <Navbar activeContent="integrations">
                {
                    integrationType === 'smooch_inside' && !currentIntegration.isEmpty() && (
                        <div>
                            <div className="item">
                                <h4>{currentIntegration.get('name')}</h4>
                                <div className="menu">
                                    <Link
                                        to={`/app/integrations/${integrationType}/${integrationId}/appearance`}
                                        className={classname('item', {'active': extra === 'appearance'})}
                                        title="Appearance"
                                    >
                                        Appearance
                                    </Link>
                                    <Link
                                        to={`/app/integrations/${integrationType}/${integrationId}/installation`}
                                        className={classname('item', {'active': extra === 'installation'})}
                                        title="Installation"
                                    >
                                        Installation
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )
                }
            </Navbar>
        )
    }
}
