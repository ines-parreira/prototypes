// @flow

import type {stateType} from '../types'

import type {InfobarActionsState} from './types'

export const getInfobarActionsState = (state: stateType): InfobarActionsState => state.infobarActions
