import {Map} from 'immutable'
import {createSelector} from 'reselect'

import {View, ViewType} from '../../../models/view/types'
import {makeGetSettingsByType} from '../../currentUser/selectors'
import {RootState} from '../../types'

import {ViewsState} from './types'

export const getOrderedViewsByType = (type: ViewType) =>
    createSelector<RootState, View[], ViewsState, Map<any, any>>(
        (state: RootState) => state.entities.views,
        (state: RootState) =>
            makeGetSettingsByType()(
                state,
                (type || '').replace('list', 'views')
            ),
        (viewsState, settings) => {
            return Object.values(viewsState)
                .filter((view) => view.type === type)
                .sort(
                    (view1, view2) =>
                        settings.getIn([
                            'data',
                            view1.id.toString(),
                            'display_order',
                        ]) -
                        settings.getIn([
                            'data',
                            view2.id.toString(),
                            'display_order',
                        ])
                )
        }
    )
