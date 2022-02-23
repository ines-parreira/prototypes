import React from 'react'
import type {Map} from 'immutable'

import {CardHeaderYotpoLoyaltyPoints} from './custom/CardHeaderYotpoLoyaltyPoints'

export default function Loyalty() {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper,
    }
}

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
