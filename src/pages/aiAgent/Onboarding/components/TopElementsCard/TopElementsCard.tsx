import React from 'react'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/Onboarding/components/Card'

import TopElementsItem from './TopElementItem/TopElementItem'
import css from './TopElementsCard.less'
import {TopElement} from './types'

type Props = {
    title: string
    topElements: TopElement[]
}

const TopElementsCard = ({title, topElements}: Props) => {
    return (
        <Card className={css.topElementsContainer}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className={css.content}>
                {topElements.map((topElement: TopElement) => (
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
