import React, {useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {bindActionCreators} from 'redux'
import {connect, ConnectedProps} from 'react-redux'

import {RootState} from '../../../state/types'
import useSearch from '../../../hooks/useSearch'
import * as widgetsActions from '../../../state/widgets/actions'
import {fetchTicket} from '../../../state/ticket/actions'
import {fetchCustomer} from '../../../state/customers/actions'

import SourceWrapper from '../../common/components/sourceWidgets/SourceWrapper.js'
import {getSourcesWithCustomer} from '../../../state/widgets/selectors'

export const TicketSourceContainer = ({
    actions,
    sources,
    ticket,
    widgets,
}: ConnectedProps<typeof connector>) => {
    const {customer} = useSearch<{customer?: string}>()
    const params = useParams<{ticketId: string}>()

    useEffect(() => {
        actions.fetchTicket(params.ticketId)

        if (customer) {
            if (
                params.ticketId === 'new' &&
                customer &&
                sources.getIn(['ticket', 'customer', 'id']) !== customer
            ) {
                actions.fetchCustomer(customer)
            }
        }
    }, [])

    return (
        <SourceWrapper
            context="ticket"
            identifier={(ticket.get(
                'id',
                params.ticketId || ''
            ) as string).toString()}
            sources={sources}
            widgets={widgets}
            actions={actions}
        />
    )
}

const connector = connect(
    (state: RootState) => ({
        ticket: state.ticket,
        widgets: state.widgets,
        sources: getSourcesWithCustomer(state),
    }),
    (dispatch) => ({
        actions: {
            fetchCustomer: bindActionCreators(fetchCustomer, dispatch),
            fetchTicket: bindActionCreators(fetchTicket, dispatch),
            widgets: bindActionCreators(widgetsActions, dispatch),
        },
    })
)

export default connector(TicketSourceContainer)
