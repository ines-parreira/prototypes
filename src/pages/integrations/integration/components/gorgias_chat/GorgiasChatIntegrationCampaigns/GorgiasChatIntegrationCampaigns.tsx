import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {Map, fromJS, List} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import moment from 'moment'
import {Breadcrumb, BreadcrumbItem, Container, Table} from 'reactstrap'
import classnames from 'classnames'

import {
    createCampaign,
    deleteCampaign,
    updateCampaign,
} from 'state/campaigns/actions'
import Button from 'pages/common/components/button/Button'
import ToggleInput from 'pages/common/forms/ToggleInput'
import PageHeader from 'pages/common/components/PageHeader'
import IconButton from 'pages/common/components/button/IconButton'
import {IntegrationType} from 'models/integration/constants'
import CampaignGenerator from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/components/CampaignGenerator/CampaignGenerator'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

import GorgiasChatIntegrationHeader from '../GorgiasChatIntegrationHeader'
import GorgiasChatIntegrationConnectedChannel from '../GorgiasChatIntegrationConnectedChannel'

import {CampaignChatHiddenWarning} from './components/CampaignChatHiddenWarning'

import css from './GorgiasChatIntegrationCampaigns.less'

type Props = {
    integration: Map<any, any>
    currentUser: Map<any, any>
} & ConnectedProps<typeof connector>

export class GorgiasChatIntegrationCampaignsComponent extends Component<Props> {
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

    handleDuplicateCampaign = async (campaign: Map<any, any>) => {
        const {createCampaign, integration} = this.props
        await createCampaign(
            fromJS({
                ...campaign.toJS(),
                id: '',
                name: `${campaign.get('name') as string} (copy)`,
                deactivated_datetime: new Date().toISOString(),
                message: {
                    text: ' ',
                    html: ' ',
                },
            }),
            integration
        )
    }

    handleDeleteCampaign = async (campaign: Map<any, any>) => {
        const {deleteCampaign, integration} = this.props
        await deleteCampaign(fromJS(campaign), integration)
    }

    render() {
        const {integration, currentUser} = this.props

        const campaigns: List<any> =
            integration.getIn(['meta', 'campaigns']) || fromJS([])

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link
                                    to={`/app/settings/channels/${IntegrationType.GorgiasChat}`}
                                >
                                    Chat
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                >
                    <GorgiasChatIntegrationConnectedChannel
                        integration={integration}
                    />
                    <Link
                        to={
                            `/app/settings/channels/${IntegrationType.GorgiasChat}/` +
                            `${integration.get('id') as string}/campaigns/new`
                        }
                        className={css.createCampaignLink}
                    >
                        <Button>Create Campaign</Button>
                    </Link>
                </PageHeader>

                <GorgiasChatIntegrationHeader integration={integration} />

                <Container fluid className={css.pageContainer}>
                    <span>
                        Use campaigns to prompt visitors of your website to
                        start chatting with your team.
                    </span>

                    <CampaignChatHiddenWarning integration={integration} />

                    <CampaignGenerator
                        integration={integration}
                        currentUser={currentUser}
                    />

                    {campaigns.isEmpty() && (
                        <div>
                            This integration doesn't have any campaigns yet.
                        </div>
                    )}
                </Container>

                {!campaigns.isEmpty() && (
                    <Table
                        className={classnames(
                            'table-integrations',
                            'mt-3',
                            css.campaignsTable
                        )}
                        hover
                    >
                        <tbody>
                            {campaigns.map((campaign: Map<any, any>) => {
                                const editLink =
                                    `/app/settings/channels/${IntegrationType.GorgiasChat}/` +
                                    `${
                                        integration.get('id') as number
                                    }/campaigns/${campaign.get('id') as number}`

                                return (
                                    <tr key={campaign.get('id') as number}>
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
                                                aria-label={`Enable campaign ${
                                                    campaign.get(
                                                        'name'
                                                    ) as string
                                                }`}
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
                                            <IconButton
                                                className={classnames('mr-1')}
                                                data-testid="duplicate-icon-button"
                                                fillStyle="ghost"
                                                intent="secondary"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    void this.handleDuplicateCampaign(
                                                        campaign
                                                    )
                                                }}
                                                title="Duplicate campaign"
                                            >
                                                file_copy
                                            </IconButton>
                                            <ConfirmationPopover
                                                buttonProps={{
                                                    intent: 'destructive',
                                                }}
                                                id={`delete-campaign-${
                                                    campaign.get('id') as string
                                                }`}
                                                content={
                                                    <>
                                                        You are about to delete{' '}
                                                        <b>
                                                            {
                                                                campaign.get(
                                                                    'name'
                                                                ) as string
                                                            }
                                                        </b>{' '}
                                                        campaign.
                                                    </>
                                                }
                                                onConfirm={() => {
                                                    return this.handleDeleteCampaign(
                                                        campaign
                                                    )
                                                }}
                                            >
                                                {({
                                                    uid,
                                                    onDisplayConfirmation,
                                                }) => (
                                                    <IconButton
                                                        className={classnames(
                                                            'mr-1'
                                                        )}
                                                        onClick={
                                                            onDisplayConfirmation
                                                        }
                                                        fillStyle="ghost"
                                                        intent="destructive"
                                                        title="Delete campaign"
                                                        id={uid}
                                                        data-testid="delete-icon-button"
                                                    >
                                                        delete
                                                    </IconButton>
                                                )}
                                            </ConfirmationPopover>
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
    createCampaign,
    deleteCampaign,
    updateCampaign,
})

export default connector(GorgiasChatIntegrationCampaignsComponent)
