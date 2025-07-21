import { Component } from 'react'

import type { Map } from 'immutable'

import { CardCustomization } from 'Widgets/modules/Template/modules/Card'

import { CardHeaderYotpoLoyaltyPoints } from './CardHeaderYotpoLoyaltyPoints'

type TitleWrapperProps = {
    source: Map<string, any>
}

class TitleWrapper extends Component<TitleWrapperProps> {
    render() {
        const { source } = this.props

        return (
            <>
                <CardHeaderYotpoLoyaltyPoints
                    value={source.getIn(['point_balance'])}
                />
            </>
        )
    }
}

export const loyaltyCustomization: CardCustomization = {
    editionHiddenFields: ['link'],
    TitleWrapper,
}
