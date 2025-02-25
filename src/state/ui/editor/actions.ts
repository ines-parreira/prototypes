import { createAction } from '@reduxjs/toolkit'

import {
    EDITOR_FOCUSED,
    LINK_EDITION_ENDED,
    LINK_EDITION_STARTED,
} from './constants'

export const linkEditionStarted = createAction(LINK_EDITION_STARTED)
export const linkEditionEnded = createAction(LINK_EDITION_ENDED)

export const editorFocused = createAction<boolean>(EDITOR_FOCUSED)
