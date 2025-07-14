import React, { PropsWithChildren } from 'react'

import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import { DashboardSectionSchema } from 'domains/reporting/pages/dashboards/types'

type Props = {
    schema: DashboardSectionSchema
}

export const DashboardsSection = ({ children }: PropsWithChildren<Props>) => {
    return <DashboardSection>{children}</DashboardSection>
}
