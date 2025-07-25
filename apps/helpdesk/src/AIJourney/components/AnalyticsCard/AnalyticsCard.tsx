import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'
import { useParams } from 'react-router-dom'

import {
    CartAbandonedJourneyConfigurationApiDTO,
    JourneyApiDTO,
    JourneyStatusEnum,
} from '@gorgias/convert-client'
import { Integration } from '@gorgias/helpdesk-types'

import { AnalyticsData } from 'AIJourney/components/AnalyticsData/AnalyticsData'
import { DiscountCard } from 'AIJourney/components/DiscountCard/DiscountCard'
import { useJourneyUpdateHandler } from 'AIJourney/hooks'
import greenLightningIcon from 'assets/img/ai-journey/green-lightning.svg'
import greyLightningIcon from 'assets/img/ai-journey/lightning.svg'
import orangeLightningIcon from 'assets/img/ai-journey/orange-lightning.svg'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { EmptyState } from './components/EmptyState/EmptyState'
import { Footer } from './components/Footer/Footer'
import { MoreOptions } from './components/MoreOptions/MoreOptions'

import css from './AnalyticsCard.less'

type AnalyticsCardProps = {
    analyticsData: any[]
    journeyConfigurations?: CartAbandonedJourneyConfigurationApiDTO
    integrationId?: number
    currentIntegration?: Integration
    abandonedCartJourney: JourneyApiDTO
    totalSent?: string
}

export const AnalyticsCard = ({
    analyticsData,
    journeyConfigurations,
    integrationId,
    currentIntegration,
    abandonedCartJourney,
    totalSent,
}: AnalyticsCardProps) => {
    const { shopName } = useParams<{ shopName: string }>()
    const dispatch = useAppDispatch()
    const [journeyState, setJourneyState] = useState<JourneyStatusEnum>(
        abandonedCartJourney.state,
    )

    useEffect(() => {
        setJourneyState(abandonedCartJourney.state)
    }, [abandonedCartJourney])

    const statusIcon = {
        active: greenLightningIcon,
        paused: orangeLightningIcon,
        draft: greyLightningIcon,
    }

    const statusBadgeClass = classNames(css.statusBadge, {
        [css['statusBadge--active']]: journeyState === 'active',
        [css['statusBadge--paused']]: journeyState === 'paused',
    })

    const { offer_discount: isDiscountEnabled } = journeyConfigurations || {}

    const { handleUpdate } = useJourneyUpdateHandler({
        integrationId,
        currentIntegration,
        abandonedCartJourney,
    })

    const handleUpdateJourneyState = useCallback(async () => {
        try {
            const { data: newData } = await handleUpdate(
                journeyState === JourneyStatusEnum.Active
                    ? JourneyStatusEnum.Paused
                    : JourneyStatusEnum.Active,
            )
            setJourneyState(newData.state)
        } catch (error) {
            void dispatch(
                notify({
                    message: `Error updating journey: ${error}`,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [journeyState, dispatch, handleUpdate])

    // const isEmpty = !analyticsData?.length
    const isEmpty = true

    return (
        <div className={css.analyticsCard}>
            <div className={css.analyticsContent}>
                <div className={css.status}>
                    <img src={statusIcon[journeyState]} alt="sphere-icon" />
                    <span>Abandoned Cart</span>
                    <div className={statusBadgeClass}>
                        {journeyState?.toUpperCase()}
                    </div>
                    <MoreOptions
                        shopName={shopName}
                        journeyState={journeyState}
                        handleChangeStatus={handleUpdateJourneyState}
                    />
                </div>
                {isEmpty ? (
                    <EmptyState />
                ) : (
                    <>
                        <AnalyticsData data={analyticsData} />
                        {!isDiscountEnabled && <DiscountCard />}
                    </>
                )}
            </div>
            {!isEmpty && (
                <Footer
                    maxDiscount={journeyConfigurations?.max_discount_percent}
                    totalSent={totalSent}
                />
            )}
        </div>
    )
}
