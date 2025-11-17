import { createAction } from '@reduxjs/toolkit'

import { VIEWS_COUNT_FETCHED } from './constants'
import type { ViewsCountState } from './types'

export const viewsCountFetched =
    createAction<ViewsCountState>(VIEWS_COUNT_FETCHED)
