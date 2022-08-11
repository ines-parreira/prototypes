import React, {ContextType} from 'react'
import type {Map} from 'immutable'

import logo from 'assets/img/infobar/yotpo.svg'

import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import ExpandAllButton from '../ExpandAllButton'
import {CardHeaderStatusLabel} from '../CardHeaderStatusLabel'
import {StaticField} from '../StaticField'
import {CardHeaderYotpoBadge} from './custom/CardHeaderYotpoBadge'

import {CardHeaderYotpoRatingThumbs} from './custom/CardHeaderYotpoRatingThumbs'

export default function Customer() {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper,
        AfterTitle,
        BeforeContent,
    }
}

type AfterTitleProps = {
    source: Map<string, any>
}

class AfterTitle extends React.Component<AfterTitleProps> {
    render() {
        const {source} = this.props

        return (
            <>
                <StaticField noBold>
                    <CardHeaderYotpoRatingThumbs
                        label="Avg. rating"
                        value={source.getIn([
                            'reviews_statistics',
                            'avg_product_rating',
                        ])}
                    />
                </StaticField>
                <StaticField label="Reviews">
                    {source.getIn(
                        ['reviews_statistics', 'total_reviews'],
                        'N/A'
                    )}
                </StaticField>
            </>
        )
    }
}

type TitleWrapperProps = {
    source: Map<string, any>
}

class TitleWrapper extends React.Component<TitleWrapperProps> {
    static contextType = IntegrationContext
    context!: ContextType<typeof IntegrationContext>
    render() {
        const {source} = this.props
        const pointBalance = source.getIn([
            'loyalty_statistics',
            'point_balance',
        ])
        const vipTierName = source.getIn([
            'loyalty_statistics',
            'vip_tier_name',
        ])
        return (
            <>
                <ExpandAllButton />
                <CardHeaderTitle>
                    <CardHeaderIcon src={logo} alt="Yotpo" />
                    Yotpo
                    {pointBalance > 0 && (
                        <CardHeaderYotpoBadge iconName="stars">
                            {parseFloat(pointBalance).toLocaleString()}
                        </CardHeaderYotpoBadge>
                    )}
                    <CardHeaderStatusLabel>{vipTierName}</CardHeaderStatusLabel>
                </CardHeaderTitle>
            </>
        )
    }
}

type BeforeContentProps = {
    source: Map<string, any>
}
class BeforeContent extends React.Component<BeforeContentProps> {
    render() {
        const {source} = this.props
        if (source.size < 2) {
            return (
                <StaticField noBold>
                    No statistic data are available right now.
                </StaticField>
            )
        }
        return null
    }
}
