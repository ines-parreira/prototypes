import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import classname from 'classnames'

import Navbar from '../../common/components/Navbar'

import * as integrationSelectors from './../../../state/integrations/selectors'

const pagesPerIntegrationType = {
    'smooch_inside': [
        {value: 'appearance', label: 'Appearance'},
        {value: 'installation', label: 'Installation'},
        {value: 'preferences', label: 'Preferences'},
        {value: 'campaigns', label: 'Campaigns'},
    ],
    smooch: [
        {value: 'overview', label: 'Overview'},
        {value: 'preferences', label: 'Preferences'},
    ],
    facebook: [
        {value: 'overview', label: 'Overview'},
        {value: 'customer_chat', label: 'Customer chat'},
        {value: 'preferences', label: 'Preferences'},
    ]
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
                    Object.keys(pagesPerIntegrationType).includes(integrationType) && !currentIntegration.isEmpty()
                    ? (
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
                                    config.map((pageConfig) => {
                                        return (
                                            <Link
                                                key={pageConfig.value}
                                                to={`/app/settings/integrations/${integrationType}/${integrationId}/${pageConfig.value}`}
                                                className={classname('item', {'active': extra === pageConfig.value})}
                                                title={pageConfig.label}
                                            >
                                                {pageConfig.label}
                                            </Link>
                                        )
                                    })
                                }
                                </div>
                            </div>
                        </div>
                    ) :  (<div></div>)
                    // todo(@martin): remove the empty div above when we merge flow, and instead modify the propType
                    // of `Navbar.children` to accept empty values (can't be done with propType but can be done with
                    // Flow).
                    // https://stackoverflow.com/questions/40729634/how-to-specify-null-prop-type-in-reactjs
                }
            </Navbar>
        )
    }
}
