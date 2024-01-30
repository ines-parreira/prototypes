import React, {useRef} from 'react'
import {Link} from 'react-router-dom'

import {Map} from 'immutable'

import classnames from 'classnames'

import ToggleInput from 'pages/common/forms/ToggleInput'
import Tooltip from 'pages/common/components/Tooltip'
import {useHelpCenterPublishedArticlesCount} from 'pages/automate/common/hooks/useHelpCenterPublishedArticlesCount'

import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import {TicketChannel} from 'business/types/ticket'

import {ARTICLE_RECOMMENDATION} from 'pages/automate/common/components/constants'
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
        selfServiceConfiguration?.article_recommendation_help_center_id
    )

    const isLoading =
        articleRecommendationEnabled === undefined ||
        selfServiceConfiguration === undefined ||
        (selfServiceConfiguration?.article_recommendation_help_center_id &&
            helpCenterArticlesCount === undefined)

    const disableTicketControlVolume =
        isLoading ||
        !!(
            articleRecommendationEnabled &&
            !selfServiceConfiguration?.deactivated_datetime &&
            selfServiceConfiguration?.article_recommendation_help_center_id &&
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
            state: {from: 'chat-control-ticket-volume'},
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
                    <ToggleInput
                        onClick={onToggle}
                        isToggled={
                            disableTicketControlVolume ? false : isToggled
                        }
                        isDisabled={disableTicketControlVolume}
                    >
                        Remove “Send us a message” button
                    </ToggleInput>
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
