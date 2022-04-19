import React, {useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {bindActionCreators} from 'redux'
import {connect, ConnectedProps} from 'react-redux'

import * as widgetsActions from '../../../state/widgets/actions'
import * as customersActions from '../../../state/customers/actions'

import SourceWrapper from '../../common/components/sourceWidgets/SourceWrapper'

import {RootState, StoreDispatch} from '../../../state/types'
import {getActiveCustomerId} from '../../../state/customers/selectors'
import {getSources} from '../../../state/widgets/selectors'

export const CustomerSourceContainer = ({
    actions,
    activeCustomerId,
    sources,
    widgets,
}: ConnectedProps<typeof connector>) => {
    const params = useParams<{customerId: string}>()

    useEffect(() => {
        actions.customers.fetchCustomer(params.customerId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!activeCustomerId) {
        return null
    }

    return (
        <SourceWrapper
            context="customer"
            identifier={activeCustomerId.toString()}
            sources={sources}
            widgets={widgets}
            actions={actions}
        />
    )
}

const connector = connect(
    (state: RootState) => ({
        activeCustomerId: getActiveCustomerId(state),
        sources: getSources(state),
        widgets: state.widgets,
    }),
    (dispatch: StoreDispatch) => ({
        actions: {
            customers: bindActionCreators(customersActions, dispatch),
            widgets: bindActionCreators(widgetsActions, dispatch),
        },
    })
)

export default connector(CustomerSourceContainer)
