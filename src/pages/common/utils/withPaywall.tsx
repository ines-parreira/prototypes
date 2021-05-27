import React, {ComponentProps, ComponentType} from 'react'
import {useSelector} from 'react-redux'

import {AccountFeature} from '../../../state/currentAccount/types'
import {RootState} from '../../../state/types'
import {currentAccountHasFeature} from '../../../state/currentAccount/selectors'
import Paywall from '../components/Paywall/Paywall'

export const withPaywall = (feature: AccountFeature) => {
    return (Component: ComponentType<Record<string, unknown>>) => {
        return (ownProps: ComponentProps<typeof Component>) => {
            const hasFeature = useSelector<RootState, boolean>(
                currentAccountHasFeature(feature)
            )
            return hasFeature ? (
                <Component {...ownProps} />
            ) : (
                <Paywall feature={feature} />
            )
        }
    }
}

export default withPaywall
