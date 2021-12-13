import React, {ReactNode} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import type {Map} from 'immutable'

import logo from 'assets/img/infobar/yotpo.svg'

import {CardHeaderDetails} from '../CardHeaderDetails'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import ExpandAllButton from '../ExpandAllButton'
import {CardHeaderBadge} from '../CardHeaderBadge'
import {CardHeaderStatusLabel} from '../CardHeaderStatusLabel'
import {CardHeaderValue} from '../CardHeaderValue'

import {CardHeaderYotpoRatingThumbs} from './custom/CardHeaderYotpoRatingThumbs'
import css from './Customer.less'

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
                <CardHeaderDetails>
                    <CardHeaderYotpoRatingThumbs
                        label="Avg. rating"
                        value={source.getIn([
                            'reviews_statistics',
                            'avg_product_rating',
                        ])}
                    />
                    <CardHeaderValue label="Reviews">
                        {source.getIn(
                            ['reviews_statistics', 'total_reviews'],
                            'N/A'
                        )}
                    </CardHeaderValue>
                </CardHeaderDetails>
            </>
        )
    }
}

type TitleWrapperProps = {
    children: ReactNode
    source: Map<string, any>
}

class TitleWrapper extends React.Component<TitleWrapperProps> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

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
                <CardHeaderIcon src={logo} alt="Yotpo" />
                <CardHeaderTitle>Yotpo</CardHeaderTitle>

                {pointBalance > 0 && (
                    <CardHeaderBadge iconName="stars">
                        {parseFloat(pointBalance).toLocaleString()}
                    </CardHeaderBadge>
                )}
                <CardHeaderStatusLabel>{vipTierName}</CardHeaderStatusLabel>
                <ExpandAllButton />
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
                <div className={css.emptyStateContainer}>
                    <span>No statistic data are available right now.</span>
                </div>
            )
        }
        return null
    }
}
