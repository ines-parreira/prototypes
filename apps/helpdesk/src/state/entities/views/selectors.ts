import { createSelector } from 'reselect'

import { ViewType } from 'models/view/types'
import { makeGetSettingsByType } from 'state/currentUser/selectors'
import type { RootState } from 'state/types'

export const getTicketViews = createSelector(
    (state: RootState) => state.entities.views || {},
    (viewsState) =>
        Object.values(viewsState).filter(
            (view) => view.type === ViewType.TicketList,
        ),
)

export const getOrderedViewsByType = (type: ViewType) =>
    createSelector(
        (state: RootState) => state.entities.views,
        (state: RootState) =>
            makeGetSettingsByType()(
                state,
                (type || '').replace('list', 'views'),
            ),
        (viewsState, settings) => {
            return Object.values(viewsState)
                .filter((view) => view.type === type)
                .sort(
                    (view1, view2) =>
                        (settings.getIn([
                            'data',
                            view1.id.toString(),
                            'display_order',
                        ]) ?? Infinity) -
                        (settings.getIn([
                            'data',
                            view2.id.toString(),
                            'display_order',
                        ]) ?? Infinity),
                )
        },
    )
