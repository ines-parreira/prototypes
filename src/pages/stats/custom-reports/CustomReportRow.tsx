import React, {PropsWithChildren} from 'react'

import DashboardSection from 'pages/stats/DashboardSection'

export const CustomReportRow = ({children}: PropsWithChildren<unknown>) => {
    return <DashboardSection>{children}</DashboardSection>
}
