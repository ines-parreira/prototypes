import { useCallback, useEffect, useMemo, useRef } from 'react'

import { motion } from 'framer-motion'
import { Virtuoso } from 'react-virtuoso'

import { Button, Heading, Skeleton, Text } from '@gorgias/axiom'

import type { OpportunityPageState } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'

import { OPPORTUNITY_CARD_HEIGHT } from '../../constants'
import { OPPORTUNITIES_PAGE_SIZE } from '../../hooks/useKnowledgeServiceOpportunities'
import { useOpportunitiesSidebar } from '../../hooks/useOpportunitiesSidebar'
import type { Opportunity, SidebarOpportunityItem } from '../../types'
import { checkAndTriggerAutoFetch } from '../../utils/autoFetchScrollChecker'
import { OpportunityCard } from '../OpportunityCard/OpportunityCard'
import { OpportunityCardSkeleton } from '../OpportunityCardSkeleton/OpportunityCardSkeleton'

import css from './OpportunitiesSidebar.less'

interface OpportunitiesSidebarProps {
    opportunities: SidebarOpportunityItem[]
    opportunitiesPageState: OpportunityPageState
    isLoading?: boolean
    onSelectOpportunity: (opportunity: SidebarOpportunityItem | null) => void
    selectedOpportunity?: Opportunity | null
    onOpportunityViewed?: (context: {
        opportunityId: string
        opportunityType: string
    }) => void
    hasNextPage?: boolean
    isFetchingNextPage?: boolean
    onEndReached?: () => void
    allowedOpportunityIds?: number[]
}

export const OpportunitiesSidebar = ({
    opportunities,
    opportunitiesPageState,
    isLoading = false,
    onSelectOpportunity,
    selectedOpportunity,
    onOpportunityViewed,
    hasNextPage = false,
    isFetchingNextPage = false,
    onEndReached,
    allowedOpportunityIds,
}: OpportunitiesSidebarProps) => {
    const virtuosoContainerRef = useRef<HTMLDivElement>(null)
    const onEndReachedRef = useRef(onEndReached)
    const { isSidebarVisible, setIsSidebarVisible } = useOpportunitiesSidebar()

    const handleToggleSidebar = useCallback(() => {
        setIsSidebarVisible(false)
    }, [setIsSidebarVisible])

    useEffect(() => {
        onEndReachedRef.current = onEndReached
    }, [onEndReached])

    useEffect(() => {
        if (selectedOpportunity) {
            onOpportunityViewed?.({
                opportunityId: selectedOpportunity.id,
                opportunityType: selectedOpportunity.type,
            })
        }
    }, [onOpportunityViewed, selectedOpportunity])

    // we need this in case the first page is fully rendered and the content is not scrollable yet
    // the virtuoso component does not trigger the endReached event in this case
    useEffect(() => {
        if (
            !opportunitiesPageState.isLoading &&
            !isFetchingNextPage &&
            hasNextPage &&
            onEndReachedRef.current &&
            virtuosoContainerRef.current
        ) {
            const timeoutId = setTimeout(() => {
                const threshold = OPPORTUNITY_CARD_HEIGHT * 2
                checkAndTriggerAutoFetch(
                    virtuosoContainerRef.current,
                    threshold,
                    hasNextPage,
                    isFetchingNextPage,
                    onEndReachedRef.current,
                )
            }, 100)
            return () => clearTimeout(timeoutId)
        }
    }, [
        opportunities.length,
        opportunitiesPageState.isLoading,
        isFetchingNextPage,
        hasNextPage,
    ])

    const handleSelectCard = useCallback(
        (opportunityId: string) => {
            const opportunity = opportunities.find(
                (opp) => opp.id === opportunityId,
            )
            if (opportunity) {
                onSelectOpportunity(opportunity)
            }
        },
        [opportunities, onSelectOpportunity],
    )

    const itemCount = opportunitiesPageState.isLoading
        ? 0
        : opportunities.length
    const itemCountText = itemCount === 1 ? '1 item' : `${itemCount} items`

    const isOpportunityRestricted = useCallback(
        (opportunityId: string) => {
            if (allowedOpportunityIds === undefined) {
                return false
            }
            return !allowedOpportunityIds.includes(Number(opportunityId))
        },
        [allowedOpportunityIds],
    )

    const renderOpportunityCard = useCallback(
        (_index: number, opportunity: SidebarOpportunityItem) => {
            return (
                <OpportunityCard
                    title={opportunity.insight}
                    type={opportunity.type}
                    ticketCount={opportunity.ticketCount}
                    selected={selectedOpportunity?.id === opportunity.id}
                    onSelect={() => handleSelectCard(opportunity.id)}
                    isRestricted={isOpportunityRestricted(opportunity.id)}
                />
            )
        },
        [selectedOpportunity?.id, handleSelectCard, isOpportunityRestricted],
    )

    const handleEndReached = useCallback(() => {
        if (hasNextPage && onEndReached) {
            onEndReached()
        }
    }, [hasNextPage, onEndReached])

    const renderFooter = useCallback(() => {
        if (isFetchingNextPage) {
            return (
                <>
                    {Array.from({ length: OPPORTUNITIES_PAGE_SIZE }).map(
                        (_, index) => (
                            <OpportunityCardSkeleton
                                key={`skeleton-${index}`}
                            />
                        ),
                    )}
                </>
            )
        }
        return null
    }, [isFetchingNextPage])

    const virtuosoComponents = useMemo(
        () => ({
            Footer: renderFooter,
        }),
        [renderFooter],
    )

    if (isLoading) {
        return (
            <motion.div
                className={css.sidebar}
                initial={false}
                animate={{
                    width: isSidebarVisible ? 300 : 0,
                    borderWidth: isSidebarVisible ? 1 : 0,
                }}
                transition={{
                    duration: 0.3,
                    ease: 'easeInOut',
                }}
            >
                <div className={css.sidebarContent}>
                    <div className={css.header}>
                        <Heading size="sm">Opportunities</Heading>
                    </div>

                    <div className={css.itemCountContainer}>
                        <Skeleton height={16} width={50} />
                    </div>

                    <div className={css.cardsContainer}>
                        {Array.from({
                            length: OPPORTUNITIES_PAGE_SIZE,
                        }).map((_, index) => (
                            <OpportunityCardSkeleton
                                key={`loading-skeleton-${index}`}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        )
    }

    if (opportunitiesPageState.showEmptyState) {
        return (
            <motion.div
                className={css.sidebar}
                initial={false}
                animate={{
                    width: isSidebarVisible ? 300 : 0,
                    borderWidth: isSidebarVisible ? 1 : 0,
                }}
                transition={{
                    duration: 0.3,
                    ease: 'easeInOut',
                }}
            >
                <div className={css.sidebarContent}>
                    <div className={css.header}>
                        <Heading size="sm">Opportunities</Heading>
                    </div>

                    <div className={css.emptyState}>
                        <Text size="sm" variant="regular">
                            No opportunities
                        </Text>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            className={css.sidebar}
            initial={false}
            animate={{
                width: isSidebarVisible ? 300 : 0,
                borderWidth: isSidebarVisible ? 1 : 0,
            }}
            transition={{
                duration: 0.3,
                ease: 'easeInOut',
            }}
        >
            <div className={css.sidebarContent}>
                <div className={css.header}>
                    <Button
                        intent="regular"
                        variant="secondary"
                        icon="system-bar-expand"
                        size="sm"
                        onClick={handleToggleSidebar}
                        aria-label="Hide sidebar"
                    />
                    <Heading size="md">Opportunities</Heading>
                </div>
                <div className={css.containerContent}>
                    <>
                        <div className={css.itemCountContainer}>
                            <Text size="sm" variant="regular">
                                {itemCountText}
                            </Text>
                        </div>
                        <div
                            className={css.virtuosoContainer}
                            ref={virtuosoContainerRef}
                        >
                            <Virtuoso
                                data={opportunities}
                                itemContent={renderOpportunityCard}
                                computeItemKey={(_index, opportunity) =>
                                    opportunity.id
                                }
                                endReached={handleEndReached}
                                atBottomThreshold={OPPORTUNITY_CARD_HEIGHT * 2}
                                fixedItemHeight={OPPORTUNITY_CARD_HEIGHT}
                                components={virtuosoComponents}
                            />
                        </div>
                    </>
                </div>
            </div>
        </motion.div>
    )
}
