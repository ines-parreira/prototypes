import { fromJS } from 'immutable'
import { createSelector } from 'reselect'

import type { RootState } from '../types'
import type { LayoutState } from './types'

export const getLayoutState = (state: RootState): LayoutState =>
    state.layout || fromJS({})

export const getCurrentOpenedPanel = createSelector(
    getLayoutState,
    (state) => (state.get('openedPanel') as string) || null,
)

export const isOpenedPanel = (name: string) =>
    createSelector(getCurrentOpenedPanel, (openedPanel) => openedPanel === name)
