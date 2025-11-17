import { createSelector } from 'reselect'

import type { RootState } from 'state/types'

import type { SingleSenderVerificationsState } from './types'

export const getSingleSenderVerifications = (
    state: RootState,
): SingleSenderVerificationsState =>
    state.entities?.singleSenderVerifications || {}

export const getSingleSenderVerification = (id: number) =>
    createSelector(
        getSingleSenderVerifications,
        (singleSenderVerifications) => singleSenderVerifications[id],
    )
