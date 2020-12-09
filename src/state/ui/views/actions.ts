import {createAction} from '@reduxjs/toolkit'

import {ACTIVE_VIEW_ID_SET} from './constants'

export const activeViewIdSet = createAction<Maybe<number>>(ACTIVE_VIEW_ID_SET)
