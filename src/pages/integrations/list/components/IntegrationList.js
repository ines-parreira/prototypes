import React, {PropTypes} from 'react'
import IntegrationListRow from './IntegrationListRow'
import PageHeader from '../../../common/components/PageHeader'
import {getIntegrationsList} from '../../../../state/integrations/helpers'

export default class IntegrationList extends React.Component {
    render() {
        const {integrations} = this.props

        const list = getIntegrationsList(integrations.get('integrations'))

        return (
            <div className="IntegrationsListView">
                <div className="view">
                    <PageHeader title="Integrations"/>
                    <div>
                        Gorgias is most useful when you connect it to other applications. Integrations let you
                        communicate with customers through multiple channels, pull more information about them
                        and perform actions in outside tools directly from Gorgias.
                    </div>

                    <div className="div-table">
                        {
                            list.map((c, i) => (
                                <IntegrationListRow key={i} integrationConfig={c}/>
                            ))
                        }
                    </div>
                </div>
            </div>
        )
    }
}

IntegrationList.propTypes = {
    integrations: PropTypes.object.isRequired
}
