import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {Map, fromJS, List} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import moment from 'moment'
import {Breadcrumb, BreadcrumbItem, Button, Container, Table} from 'reactstrap'

import * as campaignActions from '../../../../../../state/campaigns/actions.js'
import {AccountFeature} from '../../../../../../state/currentAccount/types'
import ToggleButton from '../../../../../common/components/ToggleButton'
import PageHeader from '../../../../../common/components/PageHeader'
import ForwardIcon from '../../ForwardIcon'
import ChatIntegrationNavigation from '../ChatIntegrationNavigation'
import withPaywall from '../../../../../common/utils/withPaywall'

type Props = {
    integration: Map<any, any>
} & ConnectedProps<typeof connector>

export class ChatIntegrationCampaignsContainer extends Component<Props> {
    toggleCampaign = (campaign: Map<any, any>) => {
        const {updateCampaign, integration} = this.props
        let form = campaign

        if (campaign.get('deactivated_datetime')) {
            form = form.set('deactivated_datetime', null)
        } else {
            form = form.set('deactivated_datetime', moment.utc())
        }

        void updateCampaign(form, integration)
    }

    render() {
        const {integration} = this.props

        const campaigns = (integration.getIn(['meta', 'campaigns']) ||
            fromJS([])) as List<any>

        const CampaignsContent = () => (
            <>
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
                            {campaigns.map((campaign: Map<any, any>) => {
                                const editLink = `/app/settings/integrations/${
                                    integration.get('type') as string
                                }/${
                                    integration.get('id') as number
                                }/campaigns/${campaign.get('id') as number}`

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
            </>
        )

        const PaywalledCampaigns = withPaywall(AccountFeature.ChatCampaigns)(
            CampaignsContent
        )

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
                                    to={`/app/settings/integrations/${
                                        integration.get('type') as string
                                    }`}
                                >
                                    Chat (Deprecated)
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                >
                    <Button
                        tag={Link}
                        color="success"
                        to={`/app/settings/integrations/${
                            integration.get('type') as string
                        }/${integration.get('id') as number}/campaigns/new`}
                    >
                        Create campaign
                    </Button>
                </PageHeader>
                <ChatIntegrationNavigation integration={integration} />
                <PaywalledCampaigns />
            </div>
        )
    }
}

const connector = connect(null, {
    updateCampaign: campaignActions.updateCampaign,
})

export default connector(ChatIntegrationCampaignsContainer)
