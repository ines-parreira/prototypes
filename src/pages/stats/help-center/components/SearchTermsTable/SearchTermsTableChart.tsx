import React from 'react'

import ChartCard from 'pages/stats/ChartCard'
import {SearchTermsTable} from 'pages/stats/help-center/components/SearchTermsTable/SearchTermsTable'
import {useSelectedHelpCenter} from 'pages/stats/help-center/hooks/useSelectedHelpCenter'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'

export const SearchTermsTableChart = () => {
    const {selectedHelpCenterDomain: helpCenterDomain} = useSelectedHelpCenter()
    return (
        <ChartCard title="Search terms with results" noPadding>
            {!helpCenterDomain ? (
                <NoDataAvailable
                    title="No data available"
                    description="Try adjusting filters to get results."
                    style={{height: 448}}
                />
            ) : (
                <SearchTermsTable helpCenterDomain={helpCenterDomain} />
            )}
        </ChartCard>
    )
}
