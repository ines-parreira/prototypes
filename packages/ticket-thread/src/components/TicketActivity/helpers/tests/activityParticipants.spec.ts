import { describe, expect, it } from 'vitest'

import { getActivityParticipantTextParts } from '../activityParticipants'

describe('getActivityParticipantTextParts', () => {
    it('returns no prefix or suffix for a single visible participant', () => {
        expect(
            getActivityParticipantTextParts({
                index: 0,
                hiddenCount: 0,
                visibleParticipantsCount: 1,
            }),
        ).toEqual({
            shouldPrefixWithAnd: false,
            suffix: '',
        })
    })

    it('prefixes the last visible participant with and when all participants fit', () => {
        expect(
            getActivityParticipantTextParts({
                index: 1,
                hiddenCount: 0,
                visibleParticipantsCount: 2,
            }),
        ).toEqual({
            shouldPrefixWithAnd: true,
            suffix: '',
        })
    })

    it('adds a comma to earlier visible participants when there are more than two', () => {
        expect(
            getActivityParticipantTextParts({
                index: 0,
                hiddenCount: 0,
                visibleParticipantsCount: 3,
            }),
        ).toEqual({
            shouldPrefixWithAnd: false,
            suffix: ', ',
        })
    })

    it('keeps comma separation for all but the last visible participant when some are hidden', () => {
        expect(
            getActivityParticipantTextParts({
                index: 1,
                hiddenCount: 2,
                visibleParticipantsCount: 3,
            }),
        ).toEqual({
            shouldPrefixWithAnd: false,
            suffix: ', ',
        })
    })
})
