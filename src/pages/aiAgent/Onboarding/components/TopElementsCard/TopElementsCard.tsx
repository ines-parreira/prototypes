import { Skeleton } from '@gorgias/merchant-ui-kit'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/Onboarding/components/Card'

import TopElementsItem from './TopElementItem/TopElementItem'
import { TopElement } from './types'

import css from './TopElementsCard.less'

type Props = {
    title: string
    topElements: TopElement[]
    isLoading?: boolean
}

const TopElementsCard = ({ title, topElements, isLoading }: Props) => {
    return (
        <Card className={css.topElementsContainer}>
            <CardHeader>
                {isLoading ? (
                    <Skeleton width={150} height={20} />
                ) : (
                    <CardTitle>{title}</CardTitle>
                )}
            </CardHeader>
            <CardContent className={css.content}>
                {isLoading
                    ? Array.from({ length: 3 }).map((_, idx) => (
                          <Skeleton key={idx} height={40} width="100%" />
                      ))
                    : topElements.map((topElement: TopElement) => (
                          <TopElementsItem
                              key={topElement.id}
                              topElement={topElement}
                          />
                      ))}
            </CardContent>
        </Card>
    )
}

export default TopElementsCard
