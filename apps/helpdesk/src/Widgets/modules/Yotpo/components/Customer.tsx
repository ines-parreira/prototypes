import type { ContextType } from 'react'
import { Component } from 'react'

import type { Map } from 'immutable'

import logo from 'assets/img/infobar/yotpo.svg'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import type { CardCustomization } from 'Widgets/modules/Template/modules/Card'
import { ExpandAllButton } from 'Widgets/modules/Template/modules/Card'
import { CardHeaderIcon } from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderIcon'
import { CardHeaderTitle } from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderTitle'
import { StaticField } from 'Widgets/modules/Template/modules/Field'

import { CardHeaderStatusLabel } from './CardHeaderStatusLabel'
import { CardHeaderYotpoBadge } from './CardHeaderYotpoBadge'
import { CardHeaderYotpoRatingThumbs } from './CardHeaderYotpoRatingThumbs'

type AfterTitleProps = {
    source: Map<string, any>
}

class AfterTitle extends Component<AfterTitleProps> {
    render() {
        const { source } = this.props

        return (
            <>
                <StaticField isNotBold>
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
                        'N/A',
                    )}
                </StaticField>
            </>
        )
    }
}

type TitleWrapperProps = {
    source: Map<string, any>
    isEditing: boolean
}

class TitleWrapper extends Component<TitleWrapperProps> {
    static contextType = IntegrationContext
    declare context: ContextType<typeof IntegrationContext>
    render() {
        const { source, isEditing } = this.props
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
                {!isEditing && <ExpandAllButton />}
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
class BeforeContent extends Component<BeforeContentProps> {
    render() {
        const { source } = this.props
        if (source.size < 2) {
            return (
                <StaticField isNotBold>
                    No statistic data are available right now.
                </StaticField>
            )
        }
        return null
    }
}

export const customerCustomization: CardCustomization = {
    editionHiddenFields: ['link'],
    TitleWrapper,
    AfterTitle,
    BeforeContent,
}
