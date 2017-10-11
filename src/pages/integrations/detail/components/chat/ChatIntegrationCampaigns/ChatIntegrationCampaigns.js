import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {fromJS} from 'immutable'

import moment from 'moment'

import {Breadcrumb, BreadcrumbItem, Button, Table} from 'reactstrap'
import ToggleButton from '../../../../../common/components/ToggleButton'
import {connect} from 'react-redux'

import * as campaignActions from '../../../../../../state/campaigns/actions'

@connect(null, {
    updateCampaign: campaignActions.updateCampaign
})
export default class ChatIntegrationCampaigns extends React.Component {
    static propTypes = {
        integration: PropTypes.object.isRequired,
        updateCampaign: PropTypes.func.isRequired,
    }

    toggleCampaign = (campaign) => {
        const {updateCampaign, integration} = this.props
        let form = campaign

        if (campaign.get('deactivated_datetime')) {
            form = form.set('deactivated_datetime', null)
        } else {
            form = form.set('deactivated_datetime', moment.utc())
        }

        updateCampaign(form, integration)
    }

    render() {
        const {integration} = this.props

        const campaigns = integration.getIn(['meta', 'campaigns']) || fromJS([])

        return (
             <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={`/app/integrations/${integration.get('type')}`}>
                            Chat
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={`/app/integrations/${integration.get('type')}/${integration.get('id')}`}>
                            {integration.get('name')}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        Campaigns
                    </BreadcrumbItem>
                </Breadcrumb>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1 className="mb-4">
                        Campaigns
                    </h1>

                    <Button
                        tag={Link}
                        color="primary"
                        to={`/app/integrations/${integration.get('type')}/${integration.get('id')}/campaigns/new`}
                    >
                        Create campaign
                    </Button>
                </div>

                 <p>Use campaigns to prompt visitors of your website to start chatting with your team.</p>

                 {
                     !campaigns.isEmpty() && (
                        <Table
                            className="mt-3"
                            hover
                        >
                            <tbody>
                             {
                                campaigns.map((campaign) => {
                                    const editLink = `/app/integrations/${integration.get('type')}/${integration.get('id')}/campaigns/${campaign.get('id')}`

                                    return (
                                        <tr key={campaign.get('id')}>
                                            <td className="link-full-td">
                                                <Link to={editLink}>
                                                    <div>
                                                        <b>{campaign.get('name')}</b>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="smallest align-middle">
                                                <ToggleButton
                                                    value={!campaign.get('deactivated_datetime')}
                                                    onChange={() => this.toggleCampaign(campaign)}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })
                             }
                            </tbody>
                         </Table>
                     )
                 }

                 {
                     campaigns.isEmpty() && (
                         <div>This integration doesn't have any campaigns yet.</div>
                     )
                 }
             </div>
        )
    }
}
