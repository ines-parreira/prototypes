import React, {useCallback, useEffect, useState} from 'react'
import {Link, useHistory, useLocation} from 'react-router-dom'
import moment from 'moment'
import StatsPage from 'pages/stats/StatsPage'
import {useSearchParam} from 'hooks/useSearchParam'
import useAppSelector from 'hooks/useAppSelector'
import {getHelpCenterFAQList} from 'state/entities/helpCenter/helpCenters'
import {
    AllRecommendationsStatus,
    useAIArticleRecommendationItems,
} from '../hooks/useAIArticleRecommendationItems'
import {useLocalStorageTopQuestions} from '../hooks/useLocalStorageTopQuestions'
import AutomateAllRecommendationsCard from './AutomateAllRecommendationsCard'
import css from './AutomateAllRecommendationsView.less'

const ITEMS_PER_PAGE = 15

const AutomateAllRecommendationsView = () => {
    const location = useLocation()
    const history = useHistory()
    const [helpCenterId] = useSearchParam('help_center_id')
    const [storeIntegrationId] = useSearchParam('store_integration_id')
    const [page] = useSearchParam('page')
    const currentPage = Number(page) || 1
    const [statusFilter, setStatusFilter] = useState<AllRecommendationsStatus>(
        AllRecommendationsStatus.NotCreated
    )
    const helpCenters = useAppSelector(getHelpCenterFAQList)
    const helpCenter = helpCenters.find(
        (helpCenter) => helpCenter.id === Number(helpCenterId)
    )

    const onPageChange = (page: number) => {
        if (currentPage !== page) {
            const searchParams = new URLSearchParams({
                store_integration_id: storeIntegrationId || '',
                help_center_id: helpCenterId || '',
                page: String(page),
            }).toString()
            history.push({
                pathname: location.pathname,
                search: searchParams,
            })
        }
    }

    const {
        paginatedItems,
        itemsCount,
        totalItemsCount,
        isLoading,
        batchDatetime,
    } = useAIArticleRecommendationItems({
        storeIntegrationId: Number(storeIntegrationId),
        helpCenterId: Number(helpCenterId),
        locale: helpCenter?.default_locale ?? 'en-US',
        statusFilter,
        currentPage,
        itemsPerPage: ITEMS_PER_PAGE,
    })

    const {viewedOnPages, addViewedOnPage} = useLocalStorageTopQuestions(
        Number(storeIntegrationId),
        Number(helpCenterId),
        moment(batchDatetime).toDate()
    )

    const onLeavePage = useCallback(() => {
        addViewedOnPage('all-recommendations')
    }, [addViewedOnPage])

    useEffect(() => {
        window.addEventListener('beforeunload', onLeavePage)

        return () => {
            window.removeEventListener('beforeunload', onLeavePage)
        }
    }, [onLeavePage])

    useEffect(() => {
        const unlisten = history.listen(onLeavePage)

        return () => {
            unlisten()
        }
    }, [history, onLeavePage])

    return (
        <StatsPage title="Automate">
            <div className={css.wrapper}>
                <div className={css.goBackButtonWrapper}>
                    <i className="material-icons">arrow_back</i>
                    <Link className={css.goBackButton} to={`/app/automation`}>
                        Back To Dashboard
                    </Link>
                </div>
                <div className={css.title}>
                    <div className={css.titleText}>All Recommendations</div>
                    in the last 90 days
                </div>
                <AutomateAllRecommendationsCard
                    paginatedItems={paginatedItems}
                    isLoading={isLoading}
                    itemsCount={itemsCount}
                    totalItemsCount={totalItemsCount}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                    displayNewBadge={!viewedOnPages.has('all-recommendations')}
                    helpCenterId={Number(helpCenterId)}
                />
            </div>
        </StatsPage>
    )
}

export default AutomateAllRecommendationsView
