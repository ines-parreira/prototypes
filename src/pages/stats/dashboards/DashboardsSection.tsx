import React, { PropsWithChildren } from 'react'

import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import { DashboardSectionSchema } from 'pages/stats/dashboards/types'

type Props = {
    schema: DashboardSectionSchema
}

export const DashboardsSection = ({ children }: PropsWithChildren<Props>) => {
    return <DashboardSection>{children}</DashboardSection>
}
