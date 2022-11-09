import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {Map, fromJS, List} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import moment from 'moment'
import {Breadcrumb, BreadcrumbItem, Button, Container, Table} from 'reactstrap'

import ToggleInput from 'pages/common/forms/ToggleInput'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'
import {IntegrationType} from 'models/integration/constants'
import * as campaignActions from 'state/campaigns/actions'
import ForwardIcon from '../../../../common/components/ForwardIcon'
import ChatIntegrationNavigation from '../ChatIntegrationNavigation'

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

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    Apps & integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link
                                    to={`/app/settings/integrations/${IntegrationType.SmoochInside}`}
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
                        to={`/app/settings/integrations/
                            ${IntegrationType.SmoochInside}
                        /${integration.get('id') as number}/campaigns/new`}
                    >
                        Create campaign
                    </Button>
                </PageHeader>
                <ChatIntegrationNavigation integration={integration} />
                <Container fluid className={css.pageContainer}>
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
                                    IntegrationType.SmoochInside
                                }/${
                                    integration.get('id') as number
                                }/campaigns/${campaign.get('id') as number}`

                                return (
                                    <tr key={campaign.get('id')}>
                                        <td className="smallest align-middle">
                                            <ToggleInput
                                                isToggled={
                                                    !campaign.get(
                                                        'deactivated_datetime'
                                                    )
                                                }
                                                onClick={() =>
                                                    this.toggleCampaign(
                                                        campaign
                                                    )
                                                }
                                            />
                                        </td>
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

const connector = connect(null, {
    updateCampaign: campaignActions.updateCampaign,
})

export default connector(ChatIntegrationCampaignsContainer)
