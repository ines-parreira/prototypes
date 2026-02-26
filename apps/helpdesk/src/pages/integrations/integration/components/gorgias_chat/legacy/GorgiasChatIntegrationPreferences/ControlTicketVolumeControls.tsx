import type React from 'react'
import { useRef } from 'react'

import classnames from 'classnames'
import type { Map } from 'immutable'
import { Link } from 'react-router-dom'

import {
    LegacyToggleField as ToggleField,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { TicketChannel } from 'business/types/ticket'
import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import { ARTICLE_RECOMMENDATION } from 'pages/automate/common/components/constants'
import { useHelpCenterPublishedArticlesCount } from 'pages/automate/common/hooks/useHelpCenterPublishedArticlesCount'

import css from './GorgiasChatIntegrationPreferences.less'

type Props = {
    integration: Map<any, any>
    articleRecommendationEnabled?: boolean
    selfServiceConfiguration: SelfServiceConfiguration | null
    isToggled: boolean
    onToggle: (isToggled: boolean) => void
}

const ControlTicketVolumeControls: React.FC<Props> = ({
    integration,
    articleRecommendationEnabled,
    selfServiceConfiguration,
    isToggled,
    onToggle,
}) => {
    const toggleInputRef = useRef(null)

    const helpCenterArticlesCount = useHelpCenterPublishedArticlesCount(
        selfServiceConfiguration?.articleRecommendationHelpCenterId,
    )

    const isLoading =
        articleRecommendationEnabled === undefined ||
        selfServiceConfiguration === undefined ||
        (selfServiceConfiguration?.articleRecommendationHelpCenterId &&
            helpCenterArticlesCount === undefined)

    const disableTicketControlVolume =
        isLoading ||
        !!(
            articleRecommendationEnabled &&
            !selfServiceConfiguration?.deletedDatetime &&
            selfServiceConfiguration?.articleRecommendationHelpCenterId &&
            helpCenterArticlesCount
        )

    const integrationId = integration.get('id') as string | undefined
    const shopName = integration.getIn(['meta', 'shop_name']) as
        | string
        | undefined
    const shopType = integration.getIn(['meta', 'shop_type']) as
        | string
        | undefined

    const articleRecommendationLink = integrationId &&
        shopName &&
        shopType && {
            pathname: `/app/automation/${shopType}/${shopName}/connected-channels`,
            search: `?type=${TicketChannel.Chat}&id=${integrationId}`,
            state: { from: 'chat-control-ticket-volume' },
        }

    return (
        <div className={css.formSection}>
            <h4 className={classnames(css.title, 'mb-1')}>
                Require automated interaction
            </h4>
            <div>
                <p className="mb-4">
                    Hide “Send us a message” so customers must start with an
                    automation button before they can send a message. Requiring
                    automated interactions may lower the volume of live chat and
                    offline capture tickets your team must answer manually.
                </p>
                <div
                    className={classnames(css.formGroup, 'd-inline-block')}
                    ref={toggleInputRef}
                >
                    <ToggleField
                        onChange={onToggle}
                        value={disableTicketControlVolume ? false : isToggled}
                        isDisabled={disableTicketControlVolume}
                        label={`Remove “Send us a message” button`}
                    />
                </div>
                {disableTicketControlVolume && articleRecommendationLink && (
                    <Tooltip target={toggleInputRef} autohide={false}>
                        Disable{' '}
                        <Link to={articleRecommendationLink}>
                            {ARTICLE_RECOMMENDATION}
                        </Link>{' '}
                        to remove “Send us a message” button.
                    </Tooltip>
                )}
            </div>
        </div>
    )
}

export default ControlTicketVolumeControls
