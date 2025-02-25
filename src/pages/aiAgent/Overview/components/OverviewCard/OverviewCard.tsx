import React from 'react'

import { Card } from 'pages/aiAgent/Onboarding/components/Card'

import css from './OverviewCard.less'

type Props = {
    children: React.ReactNode
}
export const OverviewCard = ({ children }: Props) => {
    return <Card className={css.container}>{children}</Card>
}
