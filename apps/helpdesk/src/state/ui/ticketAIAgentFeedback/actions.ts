import { createAction } from '@reduxjs/toolkit'

import { TicketMessage } from 'models/ticket/types'

import { UIActions } from './types'

export const changeTicketMessage = createAction<{
    message?: TicketMessage
}>(UIActions.ChangeTicketMessage)
