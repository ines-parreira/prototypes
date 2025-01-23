import React from 'react'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/Onboarding/components/Card'

import TopLocationItem from './TopLocationItem/TopLocationItem'
import css from './TopLocationsCard.less'
import {Location} from './types'

type Props = {
    title: string
    locations: Location[]
}

const TopLocationsCard = ({title, locations}: Props) => {
    return (
        <Card className={css.topLocationsContainer}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className={css.content}>
                {locations.map((location: Location) => (
                    <TopLocationItem key={location.id} location={location} />
                ))}
            </CardContent>
        </Card>
    )
}

export default TopLocationsCard
