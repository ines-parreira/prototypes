import { Skeleton } from '@gorgias/merchant-ui-kit'

import { gorgiasColors } from 'gorgias-design-system/styles'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/Onboarding/components/Card'
import TrackerCircle from 'pages/common/components/ProgressTracker/TrackerCircle'

import css from './TrackerCircleCard.less'

export type TrackerCircleCardProps = {
    percentage: number
    label: string
    title: string
    isLoading: boolean
}

const TrackerCircleCard = ({
    percentage,
    label,
    title,
    isLoading,
}: TrackerCircleCardProps) => {
    return (
        <Card className={css.score}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton height="150px" width="175px" />
                ) : (
                    <TrackerCircle
                        radius={54}
                        percentage={percentage}
                        color={gorgiasColors.secondaryOrange}
                        label={label}
                        strokeWidth={9}
                    />
                )}
            </CardContent>
        </Card>
    )
}

export default TrackerCircleCard
