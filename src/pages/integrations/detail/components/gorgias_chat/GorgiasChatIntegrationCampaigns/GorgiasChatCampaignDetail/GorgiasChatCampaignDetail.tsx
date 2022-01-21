import React from 'react'
import {Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {Link} from 'react-router-dom'
import {RootState} from 'state/types'

import {
    updateCampaign,
    createCampaign,
    deleteCampaign,
} from '../../../../../../../state/campaigns/actions'
import * as integrationsSelectors from '../../../../../../../state/integrations/selectors'
import * as agentSelectors from '../../../../../../../state/agents/selectors'
import PageHeader from '../../../../../../common/components/PageHeader'
import GorgiasChatIntegrationNavigation from '../../GorgiasChatIntegrationNavigation'

import {GorgiasChatCampaignDetailForm} from './GorgiasChatCampaignDetailForm'

type OwnProps = {
    id: string
    integration: Map<any, any>
}

const GorgiasChatCampaignDetail = (
    props: OwnProps & ConnectedProps<typeof connector>
) => {
    const {integration} = props

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
                                }/${integration.get('id') as string}`}
                            >
                                Chat
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.get('name')}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <GorgiasChatIntegrationNavigation integration={integration} />
            <GorgiasChatCampaignDetailForm {...props} />
        </div>
    )
}

const connector = connect(
    (state: RootState, props: OwnProps) => {
        return {
            campaign: integrationsSelectors.getChatIntegrationCampaignById(
                props.integration.get('id'),
                props.id
            )(state),
            agents: agentSelectors.getAgents(state),
        }
    },
    {
        createCampaign,
        updateCampaign,
        deleteCampaign,
    }
)

export default connector(GorgiasChatCampaignDetail)
