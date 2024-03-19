import React, {useMemo} from 'react'
import {Map} from 'immutable'

import {Redirect} from 'react-router-dom'
import {User} from 'config/types/user'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'

import {getHumanAgents} from 'state/agents/selectors'
import {
    getChatIntegrationCampaignById,
    getIntegrationById,
} from 'state/integrations/selectors'

import {
    createCampaign,
    deleteCampaign,
    updateCampaign,
} from 'state/campaigns/actions'

import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import {useIsConvertUiDecouplingEnabled} from 'pages/convert/common/hooks/useIsConvertUiDecouplingEnabled'
import {canSeeCampaignImprovements} from '../../utils/canSeeCampaignImprovements'
import {chatIsShopifyStore} from '../../utils/chatIsShopifyStore'

import {CampaignDetailsForm} from '../../providers/CampaignDetailsForm'

import {ChatCampaign} from '../../types/Campaign'

import {BaseCampaignDetails} from '../BaseCampaignDetails'
import {AdvancedCampaignDetails} from '../AdvancedCampaignDetails'

type OwnProps = {
    id: string
    integration: Map<any, any>
}

export const ChatCampaignDetailsFactory = ({
    integration,
    id,
}: OwnProps): JSX.Element => {
    const dispatch = useAppDispatch()
    const isConvertSubscriber: boolean = useIsConvertSubscriber()
    const isConvertUiDecouplingEnabled = useIsConvertUiDecouplingEnabled()

    const campaign = useAppSelector(
        getChatIntegrationCampaignById(integration.get('id'), id)
    )
    const shopify = useAppSelector(
        getIntegrationById(integration.getIn(['meta', 'shop_integration_id']))
    )

    const agents = useAppSelector(getHumanAgents)

    const handleCreateCampaign = async (
        campaign: Map<any, any>,
        innerIntegration: Map<any, any>
    ) => {
        return dispatch(createCampaign(campaign, innerIntegration))
    }

    const handleUpdateCampaign = async (
        campaign: Map<any, any>,
        innerIntegration: Map<any, any>
    ) => {
        return dispatch(updateCampaign(campaign, innerIntegration))
    }

    const handleDeleteCampaign = async (
        campaign: Map<any, any>,
        innerIntegration: Map<any, any>
    ) => {
        return dispatch(deleteCampaign(campaign, innerIntegration))
    }

    const memoAgents = useMemo(() => {
        if (agents) {
            return agents.toJS() as User[]
        }
        return []
    }, [agents])

    const memoCampaign = useMemo(() => {
        return campaign.toJS() as ChatCampaign
    }, [campaign])

    const integrationId = integration.get('id') as number
    if (isConvertUiDecouplingEnabled && !!integrationId && !!id) {
        return <Redirect to={`/app/convert/${integrationId}/campaigns/${id}`} />
    }

    return (
        <BaseCampaignDetails integration={integration}>
            {canSeeCampaignImprovements() ? (
                <CampaignDetailsForm
                    agents={memoAgents}
                    campaign={memoCampaign}
                    isEditMode={id !== 'new'}
                    isShopifyStore={chatIsShopifyStore(integration)}
                    integration={integration}
                    shopifyIntegration={shopify}
                    createCampaign={handleCreateCampaign}
                    updateCampaign={handleUpdateCampaign}
                    deleteCampaign={handleDeleteCampaign}
                />
            ) : (
                <AdvancedCampaignDetails
                    agents={memoAgents}
                    id={id}
                    integration={integration}
                    shopifyIntegration={shopify}
                    isConvertSubscriber={isConvertSubscriber}
                    campaign={memoCampaign}
                    createCampaign={handleCreateCampaign}
                    updateCampaign={handleUpdateCampaign}
                    deleteCampaign={handleDeleteCampaign}
                />
            )}
        </BaseCampaignDetails>
    )
}

export default ChatCampaignDetailsFactory
