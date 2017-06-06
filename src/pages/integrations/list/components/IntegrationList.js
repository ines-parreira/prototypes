import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {Alert} from 'reactstrap'

import IntegrationListRow from './IntegrationListRow'
import PageHeader from '../../../common/components/PageHeader'
import {getIntegrationsList} from '../../../../state/integrations/helpers'

export default class IntegrationList extends React.Component {
    render() {
        const {integrations, isAllowedToCreate} = this.props

        const list = getIntegrationsList(integrations.get('integrations'))

        return (
            <div>
                <PageHeader title="Integrations"/>

                <div>
                    Gorgias is most useful when you connect it to other applications. Integrations let you
                    communicate with customers through multiple channels, pull more information about them
                    and perform actions in outside tools directly from Gorgias.
                </div>
                {
                    !isAllowedToCreate && (
                        <Alert color="danger">
                            <i className="fa fa-exclamation-circle"/>
                            <strong> Your account has reached the integration limit. </strong>
                            <span>To add more integrations, upgrade your <Link
                                to="/app/settings/billing">plan</Link>.</span>
                        </Alert>
                    )
                }
                <div className="div-table">
                    {
                        list.map((c, i) => (
                            <IntegrationListRow key={i} integrationConfig={c}/>
                        ))
                    }
                </div>
            </div>
        )
    }
}

IntegrationList.propTypes = {
    integrations: PropTypes.object.isRequired,
    isAllowedToCreate: PropTypes.bool.isRequired
}
