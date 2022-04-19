import React, {useEffect, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS, Map} from 'immutable'
import {useParams} from 'react-router-dom'

import {RootState, StoreDispatch} from '../../../state/types'
import Infobar from '../../common/components/infobar/Infobar/Infobar'
import * as WidgetActions from '../../../state/widgets/actions'
import {fetchPreviewCustomer} from '../../../state/infobar/actions'
import {getSourcesWithCustomer} from '../../../state/widgets/selectors'
import {WidgetContextType} from '../../../state/widgets/types'

type OwnProps = {
    isEditingWidgets?: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

export const TicketInfobarContainer = ({
    actions,
    isEditingWidgets,
    sources,
    ticket,
    widgets,
}: Props) => {
    const params = useParams<{ticketId: string}>()

    useEffect(() => {
        actions.widgets.selectContext()
        actions.widgets.fetchWidgets()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const customer = useMemo(
        () =>
            (sources.getIn(['ticket', 'customer']) || fromJS({})) as Map<
                any,
                any
            >,
        [sources]
    )

    return (
        <Infobar
            // $TsFixMe remove casting once props drilling removed
            actions={actions as any}
            sources={sources}
            isRouteEditingWidgets={!!isEditingWidgets}
            identifier={(
                ticket.get('id', params.ticketId || '') as number
            ).toString()}
            customer={customer}
            widgets={widgets}
            context={WidgetContextType.Ticket}
        />
    )
}

const connector = connect(
    (state: RootState) => ({
        ticket: state.ticket,
        widgets: state.widgets,
        sources: getSourcesWithCustomer(state),
    }),
    (dispatch: StoreDispatch) => ({
        actions: {
            fetchPreviewCustomer: bindActionCreators(
                fetchPreviewCustomer,
                dispatch
            ),
            widgets: bindActionCreators(WidgetActions, dispatch),
        },
    })
)

export default connector(TicketInfobarContainer)
