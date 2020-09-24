import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import type {RootState} from '../types'

import {LayoutState} from './types'

export const getLayoutState = (state: RootState): LayoutState =>
    state.layout || fromJS({})

export const getCurrentOpenedPanel = createSelector<
    RootState,
    Maybe<string>,
    LayoutState
>(getLayoutState, (state) => (state.get('openedPanel') as string) || null)

export const isOpenedPanel = (name: string) =>
    createSelector<RootState, boolean, Maybe<string>>(
        getCurrentOpenedPanel,
        (openedPanel) => openedPanel === name
    )
