import {createAction} from '@reduxjs/toolkit'

import {LINK_EDITION_STARTED, LINK_EDITION_ENDED} from './constants'

export const linkEditionStarted = createAction(LINK_EDITION_STARTED)

export const linkEditionEnded = createAction(LINK_EDITION_ENDED)
