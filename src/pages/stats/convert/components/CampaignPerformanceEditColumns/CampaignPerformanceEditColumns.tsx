import React from 'react'

import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'

import {EditTableColumns} from 'pages/stats/common/components/Table/EditTableColumns'

import {
    CAMPAIGN_TABLE_COLUMN_TITLES,
    CampaignPerformanceTooltipConfig,
    CampaignPerformanceTableViews,
} from 'pages/stats/convert/components/CampaignTableStats/constants'
import {useCampaignPerformanceTableSetting} from 'pages/stats/convert/hooks/useCampaignPerformanceTableSetting'
import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'
import {getCurrentUser} from 'state/currentUser/selectors'
import {hasRole} from 'utils'

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
