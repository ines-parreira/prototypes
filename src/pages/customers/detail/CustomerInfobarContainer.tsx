import React, {useEffect} from 'react'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {bindActionCreators} from 'redux'

import Infobar from '../../common/components/infobar/Infobar/Infobar'
import {fetchPreviewCustomer} from '../../../state/infobar/actions'
import {InfobarState} from '../../../state/infobar/types'
import * as WidgetActions from '../../../state/widgets/actions'
import {WidgetContextType} from '../../../state/widgets/types'
import {
    getActiveCustomer,
    getActiveCustomerId,
} from '../../../state/customers/selectors'
import {getSources} from '../../../state/widgets/selectors'
import {RootState} from '../../../state/types'

type Props = {
    infobar: InfobarState
    isEditingWidgets: boolean
} & ConnectedProps<typeof connector> &
    RouteComponentProps

export const CustomerInfobarContainer = ({
    actions,
    activeCustomer,
    activeCustomerId,
    isEditingWidgets,
    sources,
    widgets,
}: Props) => {
    useEffect(() => {
        actions.widgets.selectContext(WidgetContextType.Customer)
        actions.widgets.fetchWidgets()
    }, [])

    if (!activeCustomerId) {
        return null
    }

    const identifier = activeCustomerId.toString()

    return (
        <Infobar
            // $TsFixMe remove casting once props drilling removed
            actions={actions as any}
            sources={sources}
            isRouteEditingWidgets={!!isEditingWidgets}
            identifier={identifier}
            customer={activeCustomer}
            widgets={widgets}
            context={WidgetContextType.Customer}
        />
    )
}

const connector = connect(
    (state: RootState) => ({
        widgets: state.widgets,
        activeCustomer: getActiveCustomer(state),
        activeCustomerId: getActiveCustomerId(state),
        sources: getSources(state),
    }),
    (dispatch) => ({
        actions: {
            fetchPreviewCustomer: bindActionCreators(
                fetchPreviewCustomer,
                dispatch
            ),
            widgets: bindActionCreators(WidgetActions, dispatch),
        },
    })
)

export default withRouter(connector(CustomerInfobarContainer))
