import React from 'react'

import {getCurrentUser} from 'state/currentUser/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {UserRole} from 'config/types/user'
import {hasRole} from 'utils'

import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'
import {useCampaignPerformanceTableSetting} from 'pages/stats/convert/hooks/useCampaignPerformanceTableSetting'
import {EditTableColumns} from 'pages/stats/common/components/Table/EditTableColumns'

import {
    CAMPAIGN_TABLE_COLUMN_TITLES,
    CampaignPerformanceTooltipConfig,
    CampaignPerformanceTableViews,
} from 'pages/stats/convert/components/CampaignTableStats/constants'

export const CampaignPerformanceEditColumns = () => {
    const currentUser = useAppSelector(getCurrentUser)

    if (!hasRole(currentUser, UserRole.Admin)) {
        return null
    }

    // To avoid running useAppSelector conditionally
    const dummySelector = () => {
        return undefined
    }

    return (
        <EditTableColumns
            settingsSelector={dummySelector}
            fallbackViews={CampaignPerformanceTableViews}
            tableLabels={CAMPAIGN_TABLE_COLUMN_TITLES}
            tooltips={CampaignPerformanceTooltipConfig}
            leadColumn={CampaignTableKeys.CampaignName}
            useTableSetting={useCampaignPerformanceTableSetting}
        />
    )
}
