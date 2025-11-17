import type { PropsWithChildren } from 'react'
import React from 'react'

import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import type { DashboardSectionSchema } from 'domains/reporting/pages/dashboards/types'

type Props = {
    schema: DashboardSectionSchema
}

export const DashboardsSection = ({ children }: PropsWithChildren<Props>) => {
    return <DashboardSection>{children}</DashboardSection>
}
