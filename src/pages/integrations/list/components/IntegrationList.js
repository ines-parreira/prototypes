import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {Alert, Container} from 'reactstrap'

import IntegrationListRow from './IntegrationListRow'
import PageHeader from '../../../common/components/PageHeader'
import {getIntegrationsList} from '../../../../state/integrations/helpers'

export default class IntegrationList extends React.Component {
    render() {
        const {integrations, isAllowedToCreate} = this.props

        const list = getIntegrationsList(integrations.get('integrations'))

        return (
            <div className="full-width">
                <PageHeader title="Integrations"/>

                <Container fluid className="page-container">
                    <p>
                        Gorgias is most useful when you connect it to other applications. Integrations let you
                        communicate with customers through multiple channels, pull more information about them
                        and perform actions in outside tools directly from Gorgias.
                    </p>

                    {
                        !isAllowedToCreate && (
                            <Alert color="danger">
                                <i className="fa fa-exclamation-circle mr-2" />
                                <strong> Your account has reached the integration limit. </strong>
                                To add more integrations, upgrade your <Link
                                to="/app/settings/billing" className="alert-link">plan</Link>.
                            </Alert>
                        )
                    }
                    <div className="div-table">
                        {
                            list.map((config, index) => {
                                return (
                                    <IntegrationListRow
                                        key={index}
                                        integrationConfig={config}
                                    />
                                )
                            })
                        }
                    </div>
                </Container>
            </div>
        )
    }
}

IntegrationList.propTypes = {
    integrations: PropTypes.object.isRequired,
    isAllowedToCreate: PropTypes.bool.isRequired
}
