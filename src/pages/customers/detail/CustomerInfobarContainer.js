import React, {useEffect} from 'react'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import Infobar from '../../common/components/infobar/Infobar'

import {fetchPreviewCustomer} from '../../../state/infobar/actions.ts'
import {InfobarState} from '../../../state/infobar/types.ts'
import * as WidgetActions from '../../../state/widgets/actions.ts'
import {WidgetsState} from '../../../state/widgets/types.ts'

import {
    getActiveCustomer,
    getActiveCustomerId,
} from '../../../state/customers/selectors.ts'
import {getSources} from '../../../state/widgets/selectors.ts'

type Props = {
    actions: {
        fetchPreviewCustomer: typeof fetchPreviewCustomer,
        widgets: typeof WidgetActions,
    },
    activeCustomer: Map<any, any>,
    activeCustomerId: number | null,
    infobar: InfobarState,
    isEditingWidgets: boolean,
    sources: Map<any, any>,
    widgets: WidgetsState,
}

export const CustomerInfobarContainer = ({
    actions,
    activeCustomer,
    activeCustomerId,
    infobar,
    isEditingWidgets,
    sources,
    widgets,
}: Props) => {
    useEffect(() => {
        actions.widgets.selectContext('customer')
        actions.widgets.fetchWidgets()
    }, [])

    if (!activeCustomerId) {
        return null
    }

    const identifier = activeCustomerId.toString()

    return (
        <Infobar
            actions={actions}
            infobar={infobar}
            sources={sources}
            isRouteEditingWidgets={!!isEditingWidgets}
            identifier={identifier}
            customer={activeCustomer}
            widgets={widgets}
            context="customer"
        />
    )
}

const connector = connect(
    (state) => ({
        infobar: state.infobar,
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
