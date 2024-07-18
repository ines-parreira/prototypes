import React from 'react'
import type {Map} from 'immutable'

import {CardCustomization} from 'Widgets/modules/Template/modules/Card'

import {CardHeaderYotpoLoyaltyPoints} from './CardHeaderYotpoLoyaltyPoints'

type TitleWrapperProps = {
    source: Map<string, any>
}

class TitleWrapper extends React.Component<TitleWrapperProps> {
    render() {
        const {source} = this.props

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
