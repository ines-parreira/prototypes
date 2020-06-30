// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import type {Map} from 'immutable'

import type {stateType} from '../types'

export const getLayoutState = (state: stateType): Map<*, *> =>
    state.layout || fromJS({})

export const getCurrentOpenedPanel = createSelector(
    [getLayoutState],
    (state) => state.get('openedPanel') || null
)

export const isOpenedPanel = (name: string) =>
    createSelector(
        [getCurrentOpenedPanel],
        (openedPanel) => openedPanel === name
    )
