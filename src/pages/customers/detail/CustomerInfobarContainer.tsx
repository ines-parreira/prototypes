import React, {useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import useAppDispatch from 'hooks/useAppDispatch'
import Infobar from 'pages/common/components/infobar/Infobar/Infobar'
import {
    DEPRECATED_getActiveCustomer,
    getActiveCustomerId,
} from 'state/customers/selectors'
import {InfobarState} from 'state/infobar/types'
import {RootState} from 'state/types'
import * as actions from 'state/widgets/actions'
import {getSources} from 'state/widgets/selectors'
import {WidgetEnvironment} from 'state/widgets/types'

type Props = {
    infobar: InfobarState
    isEditingWidgets: boolean
} & ConnectedProps<typeof connector>

export const CustomerInfobarContainer = ({
    activeCustomer,
    activeCustomerId,
    isEditingWidgets,
    sources,
    widgets,
}: Props) => {
    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(actions.selectContext(WidgetEnvironment.Customer))
        void dispatch(actions.fetchWidgets())
    }, [dispatch])

    if (!activeCustomerId) {
        return null
    }

    const identifier = activeCustomerId.toString()

    return (
        <Infobar
            sources={sources}
            isRouteEditingWidgets={!!isEditingWidgets}
            identifier={identifier}
            customer={activeCustomer}
            widgets={widgets}
            context={WidgetEnvironment.Customer}
        />
    )
}

const connector = connect((state: RootState) => ({
    widgets: state.widgets,
    activeCustomer: DEPRECATED_getActiveCustomer(state),
    activeCustomerId: getActiveCustomerId(state),
    sources: getSources(state),
}))

export default connector(CustomerInfobarContainer)
