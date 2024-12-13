import React, {PropsWithChildren} from 'react'

import {CustomReportSectionSchema} from 'pages/stats/custom-reports/types'
import DashboardSection from 'pages/stats/DashboardSection'

type Props = {
    schema: CustomReportSectionSchema
}

export const CustomReportSection = ({children}: PropsWithChildren<Props>) => {
    return <DashboardSection>{children}</DashboardSection>
}
