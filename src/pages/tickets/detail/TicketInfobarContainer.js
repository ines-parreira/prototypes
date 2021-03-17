import React, {useEffect, useMemo} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS} from 'immutable'
import {withRouter} from 'react-router-dom'

import Infobar from '../../common/components/infobar/Infobar'

import * as WidgetActions from '../../../state/widgets/actions.ts'
import * as InfobarActions from '../../../state/infobar/actions.ts'
import {InfobarState} from '../../../state/infobar/types.ts'
import {getSourcesWithCustomer} from '../../../state/widgets/selectors.ts'
import {WidgetsState} from '../../../state/widgets/types.ts'

type Props = {
    actions: {
        infobar: typeof InfobarActions,
        widgets: typeof WidgetActions,
    },
    infobar: InfobarState,
    isEditingWidgets?: boolean,
    match: {
        params: {
            ticketId?: string,
        },
    },
    sources: Map<any, any>,
    ticket: Map<any, any>,
    widgets: WidgetsState,
}

export const TicketInfobarContainer = ({
    actions,
    infobar,
    isEditingWidgets,
    match: {
        params: {ticketId},
    },
    sources,
    ticket,
    widgets,
}: Props) => {
    useEffect(() => {
        actions.widgets.selectContext('ticket')
        actions.widgets.fetchWidgets()
    }, [])

    const customer = useMemo(
        () => sources.getIn(['ticket', 'customer']) || fromJS({}),
        [sources]
    )

    return (
        <Infobar
            actions={actions}
            infobar={infobar}
            sources={sources}
            isRouteEditingWidgets={!!isEditingWidgets}
            identifier={ticket.get('id', ticketId || '').toString()}
            customer={customer}
            widgets={widgets}
            context="ticket"
        />
    )
}

function mapStateToProps(state) {
    return {
        infobar: state.infobar,
        ticket: state.ticket,
        widgets: state.widgets,
        sources: getSourcesWithCustomer(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            infobar: bindActionCreators(InfobarActions, dispatch),
            widgets: bindActionCreators(WidgetActions, dispatch),
        },
    }
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(TicketInfobarContainer)
)
