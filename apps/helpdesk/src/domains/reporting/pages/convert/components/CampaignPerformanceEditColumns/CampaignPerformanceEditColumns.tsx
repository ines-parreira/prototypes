import { UserRole } from 'config/types/user'
import { EditTableColumns } from 'domains/reporting/pages/common/components/Table/EditTableColumns'
import {
    CAMPAIGN_TABLE_COLUMN_TITLES,
    CampaignPerformanceTableViews,
    CampaignPerformanceTooltipConfig,
} from 'domains/reporting/pages/convert/components/CampaignTableStats/constants'
import { useCampaignPerformanceTableSetting } from 'domains/reporting/pages/convert/hooks/useCampaignPerformanceTableSetting'
import { CampaignTableKeys } from 'domains/reporting/pages/convert/types/enums/CampaignTableKeys.enum'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

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
