import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'
import { useParams } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/axiom'
import { JourneyApiDTO, JourneyStatusEnum } from '@gorgias/convert-client'

import { TotalConversationsCard } from 'AIJourney/components/AnalyticsCard/components/TotalConversationsCard/TotalConversationsCard'
import { AnalyticsData } from 'AIJourney/components/AnalyticsData/AnalyticsData'
import { JOURNEY_TYPE_MAP_TO_STRING } from 'AIJourney/constants'
import { useJourneyUpdateHandler, useKpisPerJourney } from 'AIJourney/hooks'
import { useAIJourneyTotalConversations } from 'AIJourney/hooks/useAIJourneyTotalConversations/useAIJourneyTotalConversations'
import { useFilters } from 'AIJourney/hooks/useFilters/useFilters'
import { useJourneyContext } from 'AIJourney/providers'
import greenLightningIcon from 'assets/img/ai-journey/green-lightning.svg'
import greyLightningIcon from 'assets/img/ai-journey/lightning.svg'
import orangeLightningIcon from 'assets/img/ai-journey/orange-lightning.svg'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { EmptyState } from './components/EmptyState/EmptyState'
import { Footer } from './components/Footer/Footer'
import { MoreOptions } from './components/MoreOptions/MoreOptions'

import css from './AnalyticsCard.less'

type AnalyticsCardProps = {
    integrationId: number
    journey: JourneyApiDTO
    period: {
        start: string
        end: string
    }
}

export const AnalyticsCard = ({
    integrationId,
    journey,
    period,
}: AnalyticsCardProps) => {
    const dispatch = useAppDispatch()
    const filters = useFilters()
    const { shopName } = useParams<{ shopName: string }>()
    const granularity = ReportingGranularity.Week
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)

    const [journeyState, setJourneyState] = useState<JourneyStatusEnum>(
        journey.state || JourneyStatusEnum.Draft,
    )

    const { journeyData } = useJourneyContext()

    const { type: journeyType } = journey

    const { metrics: analyticsData } = useKpisPerJourney({
        integrationId: integrationId.toString(),
        journeyId: journey.id,
        shopName,
        filters,
    })

    const totalConversations = useAIJourneyTotalConversations(
        integrationId.toString(),
        userTimezone,
        filters,
        granularity,
        journey.id,
    )

    const formattedTotalConversationsSent =
        totalConversations?.value > 1000
            ? `${(totalConversations.value / 1000).toFixed(1)}k`
            : totalConversations.value.toString()

    const isLoadingMetrics = analyticsData.some((data) => data.isLoading)
    const isEmpty = !analyticsData.some(
        (data) => data.value !== 0 && data.prevValue !== 0,
    )
    const shouldRenderTotalConversationsCard =
        !isLoadingMetrics && !isEmpty && formattedTotalConversationsSent !== '0'
    const shouldRenderFooter = !isLoadingMetrics && !isEmpty

    useEffect(() => {
        if (journey.state) setJourneyState(journey.state)
    }, [journey])

    const statusIcon = {
        active: greenLightningIcon,
        paused: orangeLightningIcon,
        draft: greyLightningIcon,
    }

    const statusBadgeClass = classNames(css.statusBadge, {
        [css['statusBadge--active']]: journeyState === 'active',
        [css['statusBadge--paused']]: journeyState === 'paused',
    })

    const analyticsContentClass = classNames(css.analyticsContent, {
        [css['analyticsContent--empty']]: isEmpty,
    })

    const { configuration: journeyConfigurations, meta: journeyMeta } =
        journeyData || {}

    const { ticket_view_id: ticketViewId } = journeyMeta || {}

    const {
        offer_discount: isDiscountEnabled,
        max_discount_percent: maxDiscount,
    } = journeyConfigurations || {}

    const { handleUpdate } = useJourneyUpdateHandler({
        integrationId,
        journeyId: journey.id,
    })

    const handleUpdateJourneyState = useCallback(async () => {
        try {
            const { data: newData } = await handleUpdate({
                journeyState:
                    journeyState === JourneyStatusEnum.Active
                        ? JourneyStatusEnum.Paused
                        : JourneyStatusEnum.Active,
                journeyMessageInstructions: journey.message_instructions,
            })
            setJourneyState(newData.state)
        } catch (error) {
            void dispatch(
                notify({
                    message: `Error updating journey: ${error}`,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [journeyState, dispatch, handleUpdate, journey.message_instructions])

    const totalRevenue = analyticsData.find(
        (data) => data.label === 'Total Revenue',
    )

    const shouldRenderMoreOptions = shopName && journeyType

    const formattedJourneyType = JOURNEY_TYPE_MAP_TO_STRING[journey.type]

    const cardContent = () => {
        if (isLoadingMetrics) {
            return <LoadingSpinner style={{ height: '25px', width: '25px' }} />
        }
        if (isEmpty) {
            return <EmptyState journeyType={formattedJourneyType} />
        }
        return (
            <>
                <AnalyticsData data={analyticsData} period={period} />
            </>
        )
    }

    return (
        <div className={css.analyticsCard}>
            <div className={analyticsContentClass}>
                <div className={css.status}>
                    <img src={statusIcon[journeyState]} alt="sphere-icon" />
                    <span>{formattedJourneyType}</span>
                    <div className={statusBadgeClass}>
                        {journeyState?.toUpperCase()}
                    </div>
                    {shouldRenderMoreOptions && (
                        <MoreOptions
                            shopName={shopName}
                            journeyState={journeyState}
                            journeyType={journeyType}
                            journeyId={journey.id}
                            handleChangeStatus={handleUpdateJourneyState}
                        />
                    )}
                </div>
                {cardContent()}
                {shouldRenderTotalConversationsCard && (
                    <TotalConversationsCard
                        totalConversations={formattedTotalConversationsSent}
                        ticketViewId={ticketViewId}
                    />
                )}
            </div>
            {shouldRenderFooter && (
                <Footer
                    isDiscountEnabled={isDiscountEnabled}
                    journeyType={journeyType}
                    maxDiscount={maxDiscount}
                    totalRevenue={totalRevenue}
                />
            )}
        </div>
    )
}
