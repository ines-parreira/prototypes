// @flow
import React from 'react'
import {Link} from 'react-router-dom'
import {type Map, fromJS} from 'immutable'
import {connect} from 'react-redux'
import moment from 'moment'
import {Breadcrumb, BreadcrumbItem, Button, Container, Table} from 'reactstrap'

import * as campaignActions from '../../../../../../state/campaigns/actions'

import ToggleButton from '../../../../../common/components/ToggleButton'
import PageHeader from '../../../../../common/components/PageHeader.tsx'
import ForwardIcon from '../../ForwardIcon'
import ChatIntegrationNavigation from '../ChatIntegrationNavigation'

type Props = {
    integration: Map<*, *>,
    updateCampaign: (Map<*, *>, Map<*, *>) => Promise<*>,
}

@connect(null, {
    updateCampaign: campaignActions.updateCampaign,
})
export default class ChatIntegrationCampaigns extends React.Component<Props> {
    toggleCampaign = (campaign: Map<*, *>) => {
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
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    Integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link
                                    to={`/app/settings/integrations/${integration.get(
                                        'type'
                                    )}`}
                                >
                                    Chat (Deprecated)
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                            <BreadcrumbItem active>Campaigns</BreadcrumbItem>
                        </Breadcrumb>
                    }
                >
                    <Button
                        tag={Link}
                        color="success"
                        to={`/app/settings/integrations/${integration.get(
                            'type'
                        )}/${integration.get('id')}/campaigns/new`}
                    >
                        Create campaign
                    </Button>
                </PageHeader>

                <ChatIntegrationNavigation integration={integration} />

                <Container fluid className="page-container">
                    <p>
                        Use campaigns to prompt visitors of your website to
                        start chatting with your team.
                    </p>

                    {campaigns.isEmpty() && (
                        <div>
                            This integration doesn't have any campaigns yet.
                        </div>
                    )}
                </Container>

                {!campaigns.isEmpty() && (
                    <Table className="table-integrations mt-3" hover>
                        <tbody>
                            {campaigns.map((campaign) => {
                                const editLink = `/app/settings/integrations/${integration.get(
                                    'type'
                                )}/${integration.get(
                                    'id'
                                )}/campaigns/${campaign.get('id')}`

                                return (
                                    <tr key={campaign.get('id')}>
                                        <td className="link-full-td">
                                            <Link to={editLink}>
                                                <div>
                                                    <b>
                                                        {campaign.get('name')}
                                                    </b>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="smallest align-middle">
                                            <ToggleButton
                                                value={
                                                    !campaign.get(
                                                        'deactivated_datetime'
                                                    )
                                                }
                                                onChange={() =>
                                                    this.toggleCampaign(
                                                        campaign
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="smallest align-middle">
                                            <ForwardIcon href={editLink} />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                )}
            </div>
        )
    }
}
