import React, {useState} from 'react'
import {Link, useHistory, useLocation} from 'react-router-dom'
import StatsPage from 'pages/stats/StatsPage'
import {useSearchParam} from 'hooks/useSearchParam'
import useAppSelector from 'hooks/useAppSelector'
import {getHelpCenterFAQList} from 'state/entities/helpCenter/helpCenters'
import {
    AllRecommendationsStatus,
    useAIArticleRecommendationItems,
} from '../hooks/useAIArticleRecommendationItems'
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

    const {paginatedItems, itemsCount, isLoading} =
        useAIArticleRecommendationItems({
            storeIntegrationId: Number(storeIntegrationId),
            helpCenterId: Number(helpCenterId),
            locale: helpCenter?.default_locale ?? 'en-US',
            statusFilter,
            currentPage,
            itemsPerPage: ITEMS_PER_PAGE,
        })

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
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                />
            </div>
        </StatsPage>
    )
}

export default AutomateAllRecommendationsView
