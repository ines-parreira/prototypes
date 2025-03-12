import React, { PropsWithChildren } from 'react'

import { DashboardSectionSchema } from 'pages/stats/dashboards/types'
import DashboardSection from 'pages/stats/DashboardSection'

type Props = {
    schema: DashboardSectionSchema
}

export const DashboardsSection = ({ children }: PropsWithChildren<Props>) => {
    return <DashboardSection>{children}</DashboardSection>
}
