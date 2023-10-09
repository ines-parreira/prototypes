import React, {useRef} from 'react'
import {Link} from 'react-router-dom'

import {Map} from 'immutable'

import classnames from 'classnames'

import {TagLabel} from 'pages/common/utils/labels'
import ToggleInput from 'pages/common/forms/ToggleInput'
import Tooltip from 'pages/common/components/Tooltip'
import {useHelpCenterPublishedArticlesCount} from 'pages/automation/common/hooks/useHelpCenterPublishedArticlesCount'

import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import {TicketChannel} from 'business/types/ticket'

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
        helpCenterArticlesCount === undefined

    const disableTicketControlVolume =
        isLoading ||
        !!(
            articleRecommendationEnabled &&
            !selfServiceConfiguration?.deactivated_datetime &&
            selfServiceConfiguration?.article_recommendation_help_center_id &&
            helpCenterArticlesCount
        )

    const integrationId = integration.get('id') as string
    const shopName = integration.getIn(['meta', 'shop_name']) as string
    const shopType = integration.getIn(['meta', 'shop_type']) as string

    return (
        <div className={css.formSection}>
            <h4 className={classnames(css.title, 'mb-1')}>
                Require automated interaction
                <TagLabel
                    className={classnames(css.controlTicketVolumeTag, 'ml-2')}
                >
                    <span className={classnames('material-icons', 'mr-1')}>
                        auto_awesome
                    </span>
                    {'Automation Add-on'}
                </TagLabel>
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
                        isToggled={isToggled}
                        isDisabled={disableTicketControlVolume}
                    >
                        Remove “Send us a message” button
                    </ToggleInput>
                </div>
                {disableTicketControlVolume && (
                    <Tooltip target={toggleInputRef} autohide={false}>
                        Disable{' '}
                        <Link
                            to={`/app/automation/${shopType}/${shopName}/connected-channels?type=${TicketChannel.Chat}&id=${integrationId}`}
                        >
                            article recommendation
                        </Link>{' '}
                        to remove “Send us a message” button.
                    </Tooltip>
                )}
            </div>
        </div>
    )
}

export default ControlTicketVolumeControls
