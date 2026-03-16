import { useEffect } from 'react'

import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { useParams } from 'react-router-dom'
import { bindActionCreators } from 'redux'

import { useSearch } from 'hooks/useSearch'

import { fetchCustomer } from '../../../state/customers/actions'
import { fetchTicket } from '../../../state/ticket/actions'
import type { RootState } from '../../../state/types'
import * as widgetsActions from '../../../state/widgets/actions'
import { getSourcesWithCustomer } from '../../../state/widgets/selectors'
import SourceWrapper from '../../common/components/sourceWidgets/SourceWrapper'

type OwnProps = {
    widgetType?: string | null
    onClose?: () => void
}

export const TicketSourceContainer = ({
    actions,
    sources,
    ticket,
    widgets,
    widgetType,
    onClose,
}: ConnectedProps<typeof connector> & OwnProps) => {
    const { customer } = useSearch<{ customer?: string }>()
    const params = useParams<{ ticketId: string }>()

    useEffect(() => {
        actions.fetchTicket(params.ticketId, { isCurrentlyOnTicket: true })

        if (customer) {
            if (
                params.ticketId === 'new' &&
                customer &&
                sources.getIn(['ticket', 'customer', 'id']) !== customer
            ) {
                actions.fetchCustomer(customer)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <SourceWrapper
            context="ticket"
            identifier={(
                ticket.get('id', params.ticketId || '') as string
            ).toString()}
            sources={sources}
            widgets={widgets}
            actions={actions}
            widgetTypeFilter={widgetType}
            onClose={onClose}
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
    }),
)

export default connector(TicketSourceContainer)
