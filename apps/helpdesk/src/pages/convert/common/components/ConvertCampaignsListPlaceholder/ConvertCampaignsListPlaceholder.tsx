import React, { useCallback, useMemo } from 'react'

import { history } from '@repo/routing'
import type { Map } from 'immutable'
import { Container } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useListCampaigns } from 'models/convert/campaign/queries'
import type { CampaignListOptions as CampaignListOptionsParams } from 'models/convert/campaign/types'
import { toJS } from 'utils'

import type { Campaign } from '../../../campaigns/types/Campaign'
import { useGetOrCreateChannelConnection } from '../../hooks/useGetOrCreateChannelConnection'
import ConvertCampaignsNewHomeInfobar from './ConvertCampaignsNewHomeInfobar'
import ConvertCampaignsTablePlaceholder from './ConvertCampaignsTablePlaceholder'

import css from './ConvertCampaignsListPlaceholder.less'

const PER_PAGE = 25
const BUTTON_TITLE = 'Edit in Convert Settings'

type Props = {
    integration: Map<any, any>
}

const ConvertCampaignsListPlaceholder = ({ integration }: Props) => {
    const { channelConnection, isLoading: isChannelConnectionLoading } =
        useGetOrCreateChannelConnection(toJS(integration))

    const campaignListOptions = useMemo(() => {
        const channelConnectionId = channelConnection?.id
        return (
            channelConnectionId
                ? {
                      channelConnectionId: channelConnectionId,
                  }
                : {}
        ) as CampaignListOptionsParams
    }, [channelConnection])

    const { data: campaigns, isLoading: areCampaignsLoading } =
        useListCampaigns(campaignListOptions, {
            enabled: !!channelConnection && !!campaignListOptions,
        })

    const allCampaigns = useMemo(() => {
        return (campaigns || []) as Campaign[]
    }, [campaigns])

    const onButtonClick = useCallback(() => {
        const integrationId: string = integration.get('id')
        const url = integrationId
            ? `/app/convert/${integrationId}/campaigns`
            : '/app/convert'

        history.push(url)
    }, [integration])

    const isLoading = useMemo(
        () => isChannelConnectionLoading || areCampaignsLoading,
        [isChannelConnectionLoading, areCampaignsLoading],
    )

    return (
        <>
            <Container fluid className={css.pageContainer}>
                <div>
                    <ConvertCampaignsNewHomeInfobar
                        integrationId={integration.get('id')}
                    />
                </div>
                <div className={css.campaignsHeader}>
                    {!isLoading && allCampaigns.length === 0 ? (
                        <p>
                            {`This integration doesn't display any campaigns yet.`}
                        </p>
                    ) : (
                        <p>Campaigns displayed through this Chat:</p>
                    )}

                    <Button
                        intent="primary"
                        fillStyle="ghost"
                        size={'medium'}
                        onClick={onButtonClick}
                        title={BUTTON_TITLE}
                    >
                        {BUTTON_TITLE}
                    </Button>
                </div>
            </Container>

            <ConvertCampaignsTablePlaceholder
                data={allCampaigns}
                isLoading={isLoading}
                perPage={PER_PAGE}
            />
        </>
    )
}

export default ConvertCampaignsListPlaceholder
