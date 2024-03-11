import React, {useCallback, useMemo} from 'react'

import {Container} from 'reactstrap'

import {Map} from 'immutable'
import {toJS} from 'utils'
import {CampaignListOptions as CampaignListOptionsParams} from 'models/convert/campaign/types'
import {useListCampaigns} from 'models/convert/campaign/queries'
import history from 'pages/history'
import Button from 'pages/common/components/button/Button'
import {useGetOrCreateChannelConnection} from '../../hooks/useGetOrCreateChannelConnection'
import {Campaign} from '../../../campaigns/types/Campaign'
import ConvertCampaignsTablePlaceholder from './ConvertCampaignsTablePlaceholder'
import css from './ConvertCampaignsListPlaceholder.less'
import ConvertCampaignsNewHomeInfobar from './ConvertCampaignsNewHomeInfobar'

const PER_PAGE = 25
const BUTTON_TITLE = 'Edit in Convert Settings'

type Props = {
    integration: Map<any, any>
}

const ConvertCampaignsListPlaceholder = ({integration}: Props) => {
    const {channelConnection} = useGetOrCreateChannelConnection(
        toJS(integration)
    )

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

    const {data: campaigns} = useListCampaigns(campaignListOptions, {
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

    return (
        <>
            <Container fluid className={css.pageContainer}>
                <div className={css.campaignsHeader}>
                    {allCampaigns.length === 0 ? (
                        <p>
                            This integration doesn't display any campaigns yet.
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
                <div>
                    <ConvertCampaignsNewHomeInfobar
                        integrationId={integration.get('id')}
                    />
                </div>
            </Container>

            {allCampaigns.length > 0 && (
                <ConvertCampaignsTablePlaceholder
                    data={allCampaigns}
                    perPage={PER_PAGE}
                />
            )}
        </>
    )
}

export default ConvertCampaignsListPlaceholder
