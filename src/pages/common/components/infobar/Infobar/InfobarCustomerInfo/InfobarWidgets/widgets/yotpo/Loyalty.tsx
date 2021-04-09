import React, {ReactNode} from 'react'
import type {Map} from 'immutable'

import {CardHeaderYotpoLoyaltyPoints} from './custom/CardHeaderYotpoLoyaltyPoints.js'

export default function Loyalty() {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper,
    }
}

type TitleWrapperProps = {
    children: ReactNode
    source: Map<string, any>
}

class TitleWrapper extends React.Component<TitleWrapperProps> {
    render() {
        const {source} = this.props

        return (
            <>
                <CardHeaderYotpoLoyaltyPoints>
                    {source.getIn(['point_balance'])}
                </CardHeaderYotpoLoyaltyPoints>
            </>
        )
    }
}
