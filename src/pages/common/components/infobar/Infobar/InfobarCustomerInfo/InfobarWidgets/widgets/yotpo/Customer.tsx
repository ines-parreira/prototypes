import React, {ReactNode} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import type {Map} from 'immutable'

import logo from '../../../../../../../../../../img/infobar/yotpo.svg'
import {CardHeaderDetails} from '../CardHeaderDetails'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import ExpandAllButton from '../ExpandAllButton'
import {CardHeaderBadge} from '../CardHeaderBadge'
import {CardHeaderStatusLabel} from '../CardHeaderStatusLabel.js'

import {CardHeaderValue} from '../CardHeaderValue'

import {CardHeaderYotpoRatingThumbs} from './custom/CardHeaderYotpoRatingThumbs.js'

export default function Customer() {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper,
        AfterTitle,
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
                    <CardHeaderYotpoRatingThumbs label="Avg. rating">
                        {source.getIn([
                            'reviews_statistics',
                            'avg_product_rating',
                        ])}
                    </CardHeaderYotpoRatingThumbs>
                    <CardHeaderValue label="Reviews">
                        {source.getIn(['reviews_statistics', 'total_reviews'])}
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

                <CardHeaderBadge iconName="stars">
                    {parseFloat(pointBalance).toLocaleString()}
                </CardHeaderBadge>
                <CardHeaderStatusLabel>{vipTierName}</CardHeaderStatusLabel>
                <ExpandAllButton />
            </>
        )
    }
}
