import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import classname from 'classnames'

import _capitalize from 'lodash/capitalize'

import Navbar from '../../common/components/Navbar'

import * as integrationSelectors from './../../../state/integrations/selectors'

const pagesPerIntegrationType = {
    'smooch_inside': ['appearance', 'installation', 'preferences'],
    smooch: ['overview', 'preferences'],
    facebook: ['overview', 'preferences'],
}

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

        const config = pagesPerIntegrationType[integrationType]

        return (
            <Navbar activeContent="integrations">
                {
                    Object.keys(pagesPerIntegrationType).includes(integrationType)
                    && !currentIntegration.isEmpty()
                    && (
                        <div>
                            <div className="item">
                                <h4>
                                    {
                                        integrationType === 'facebook'
                                            ? currentIntegration.getIn(['facebook', 'name'])
                                            : currentIntegration.get('name')
                                    }
                                </h4>
                                <div className="menu">
                                {
                                    config.map((pageName) => {
                                        return (
                                            <Link
                                                key={pageName}
                                                to={`/app/integrations/${integrationType}/${integrationId}/${pageName}`}
                                                className={classname('item', {'active': extra === pageName})}
                                                title={_capitalize(pageName)}
                                            >
                                                {_capitalize(pageName)}
                                            </Link>
                                        )
                                    })
                                }
                                </div>
                            </div>
                        </div>
                    )
                }
            </Navbar>
        )
    }
}
