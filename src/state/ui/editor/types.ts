import {PayloadActionCreator} from '@reduxjs/toolkit'

import {LINK_EDITION_STARTED, LINK_EDITION_ENDED} from './constants'

export type EditorState = {
    isEditingLink: boolean
    isFocused: boolean
}

export type EditorAction = LinkEditionStartedAction | LinkEditionEndedAction

export type LinkEditionStartedAction = PayloadActionCreator<
    undefined,
    typeof LINK_EDITION_STARTED
>

export type LinkEditionEndedAction = PayloadActionCreator<
    undefined,
    typeof LINK_EDITION_ENDED
>
