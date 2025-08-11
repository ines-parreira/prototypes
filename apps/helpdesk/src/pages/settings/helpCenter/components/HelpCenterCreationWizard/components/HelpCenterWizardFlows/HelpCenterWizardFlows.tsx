import React, { useState } from 'react'

import classnames from 'classnames'

import { Skeleton } from '@gorgias/axiom'

import { TicketChannel } from 'business/types/ticket'
import WorkflowsFeatureList, {
    Entrypoint,
} from 'pages/automate/common/components/WorkflowsFeatureList'
import { ChannelLanguage } from 'pages/automate/common/types'
import useWorkflowChannelSupport, {
    WorkflowChannelSupportContext,
} from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import { useHelpCenterFlows } from '../../hooks/useHelpCenterFlows'
import { AnimatedFadeInOut } from '../AnimatedFadeInOut/AnimatedFadeInOut'

import css from './HelpCenterWizardFlows.less'

const FLOWS_LIMIT = 5

type HelpCenterWizardFlowsProps = {
    shopName: string
    shopType: string
    helpCenterId: number
    supportedLocales: ChannelLanguage[]
    flows: Entrypoint[]
    onChange: (entrypoints: Entrypoint[]) => void
    isLoading: boolean
    isDisabled?: boolean
}

const HelpCenterWizardFlows = ({
    shopName,
    shopType,
    helpCenterId,
    supportedLocales,
    onChange,
    flows,
    isLoading,
    isDisabled = false,
}: HelpCenterWizardFlowsProps) => {
    const [isShowMore, setIsShowMore] = useState(false)

    const {
        entrypoints,
        isLoading: isWorkflowLoading,
        workflowConfigurations,
        storeIntegration,
        workflowsEntrypoints,
    } = useHelpCenterFlows({
        shopType,
        shopName,
        supportedLocales,
        flows,
    })

    const workflowChannelSupportContext = useWorkflowChannelSupport(
        shopType,
        shopName,
    )

    const onShowMore = () => {
        setIsShowMore(true)
    }

    const shouldDisplayShowMoreButton =
        !isShowMore && entrypoints.length > FLOWS_LIMIT

    if (entrypoints.length === 0) {
        return null
    }

    return (
        <div
            className={classnames({
                [css.disabled]: isDisabled,
            })}
        >
            <div className="heading-page-semibold mb-1">Flows</div>
            <div className="mb-4">
                Enable up to 6 flows on your Help Center. Only flows matching
                the Help Center language are displayed.
            </div>

            {storeIntegration && (
                <WorkflowChannelSupportContext.Provider
                    value={workflowChannelSupportContext}
                >
                    <AnimatedFadeInOut isLoading={isWorkflowLoading}>
                        {isWorkflowLoading || isLoading ? (
                            <div className={css.loadingContainer}>
                                {Array(FLOWS_LIMIT)
                                    .fill(null)
                                    .map((_, index) => (
                                        <Skeleton key={index} height={32} />
                                    ))}
                            </div>
                        ) : entrypoints.length === 0 ? (
                            <div className={css.noFlowsText}>
                                No flows available.
                            </div>
                        ) : (
                            <WorkflowsFeatureList
                                withLabel={false}
                                configurations={workflowConfigurations ?? []}
                                allEntrypoints={entrypoints}
                                channelType={TicketChannel.HelpCenter}
                                channelId={helpCenterId.toString()}
                                integrationId={storeIntegration.id}
                                channelLanguages={supportedLocales}
                                entrypoints={workflowsEntrypoints}
                                maxActiveWorkflows={10}
                                itemLimit={isShowMore ? undefined : FLOWS_LIMIT}
                                onChange={onChange}
                                limitTooltipMessage="You’ve reached the maximum number of enabled flows. Disable another flow in order to enable this flow."
                            />
                        )}
                    </AnimatedFadeInOut>

                    {shouldDisplayShowMoreButton && (
                        <div className={css.showMoreContainer}>
                            <Button
                                fillStyle="ghost"
                                size="medium"
                                onClick={onShowMore}
                            >
                                <ButtonIconLabel
                                    icon="double_arrow_down"
                                    iconClassName={css.shopMoreIcon}
                                >
                                    Show More
                                </ButtonIconLabel>
                            </Button>
                        </div>
                    )}
                </WorkflowChannelSupportContext.Provider>
            )}
        </div>
    )
}

export default HelpCenterWizardFlows
