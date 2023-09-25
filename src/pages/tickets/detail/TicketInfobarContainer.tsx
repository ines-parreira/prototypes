import React, {useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {useParams} from 'react-router-dom'

import {RootState} from 'state/types'
import useAppDispatch from 'hooks/useAppDispatch'
import * as actions from 'state/widgets/actions'
import {WidgetContextType} from 'state/widgets/types'
import {getSourcesWithCustomer, getWidgetsState} from 'state/widgets/selectors'
import Infobar from 'pages/common/components/infobar/Infobar/Infobar'

type OwnProps = {
    isEditingWidgets?: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

export const TicketInfobarContainer = ({
    isEditingWidgets,
    sources,
    widgets,
}: Props) => {
    const params = useParams<{ticketId: string}>()
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(actions.selectContext())
        void dispatch(actions.fetchWidgets())
    }, [dispatch])

    const customer =
        sources.getIn(['ticket', 'customer']) || (fromJS({}) as Map<any, any>)

    return (
        <Infobar
            sources={sources}
            isRouteEditingWidgets={!!isEditingWidgets}
            identifier={(
                sources.getIn(['ticket', 'id'], params.ticketId || '') as number
            ).toString()}
            customer={customer}
            widgets={widgets}
            context={WidgetContextType.Ticket}
        />
    )
}

const connector = connect((state: RootState) => ({
    widgets: getWidgetsState(state),
    sources: getSourcesWithCustomer(state),
}))

export default connector(TicketInfobarContainer)
