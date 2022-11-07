import React, {useMemo} from 'react'
import {Map} from 'immutable'

import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import {User} from 'config/types/user'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'

import {getAgents} from 'state/agents/selectors'
import {getChatIntegrationCampaignById} from 'state/integrations/selectors'

import {
    createCampaign,
    deleteCampaign,
    updateCampaign,
} from 'state/campaigns/actions'

import {GorgiasChatCampaignDetailForm} from '../../components/CampaignDetailForm'

import {BaseCampaignDetails} from '../BaseCampaignDetails'
import {AdvancedCampaignDetails} from '../AdvancedCampaignDetails'

import {ChatCampaign} from '../../types/Campaign'

type OwnProps = {
    id: string
    integration: Map<any, any>
}

export const ChatCampaignDetailsFactory = ({
    integration,
    id,
}: OwnProps): JSX.Element => {
    const dispatch = useAppDispatch()
    const isRevenueTester: boolean =
        useFlags()[FeatureFlagKey.RevenueAlphaTesters]

    const campaign = useAppSelector(
        getChatIntegrationCampaignById(integration.get('id'), id)
    )
    const agents = useAppSelector(getAgents)

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

    return (
        <BaseCampaignDetails integration={integration}>
            {isRevenueTester ? (
                <AdvancedCampaignDetails
                    agents={memoAgents}
                    id={id}
                    integration={integration}
                    isRevenueTester={isRevenueTester}
                    campaign={memoCampaign}
                    createCampaign={handleCreateCampaign}
                    updateCampaign={handleUpdateCampaign}
                    deleteCampaign={handleDeleteCampaign}
                />
            ) : (
                <GorgiasChatCampaignDetailForm
                    id={id}
                    integration={integration}
                    campaign={campaign}
                    agents={agents}
                    createCampaign={handleCreateCampaign}
                    updateCampaign={handleUpdateCampaign}
                    deleteCampaign={handleDeleteCampaign}
                />
            )}
        </BaseCampaignDetails>
    )
}

export default ChatCampaignDetailsFactory
