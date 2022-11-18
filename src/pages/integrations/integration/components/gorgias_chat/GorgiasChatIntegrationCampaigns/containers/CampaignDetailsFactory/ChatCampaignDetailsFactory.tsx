import React, {useMemo} from 'react'
import {Map} from 'immutable'

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

import {useIsRevenueBetaTester} from '../../hooks/useIsRevenueBetaTester'

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
    const isRevenueBetaTester: boolean = useIsRevenueBetaTester()

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
            <AdvancedCampaignDetails
                agents={memoAgents}
                id={id}
                integration={integration}
                isRevenueBetaTester={isRevenueBetaTester}
                campaign={memoCampaign}
                createCampaign={handleCreateCampaign}
                updateCampaign={handleUpdateCampaign}
                deleteCampaign={handleDeleteCampaign}
            />
        </BaseCampaignDetails>
    )
}

export default ChatCampaignDetailsFactory
