import { describe, expect, it } from 'vitest'

import {
    formatHiddenParticipantsLabel,
    getActivityParticipantTextParts,
} from '#activity/helpers/activityParticipants'

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

describe('formatHiddenParticipantsLabel', () => {
    it('returns the singular label for one hidden participant', () => {
        expect(formatHiddenParticipantsLabel(1)).toBe('1 other')
    })

    it('returns the plural label for multiple hidden participants', () => {
        expect(formatHiddenParticipantsLabel(2)).toBe('2 others')
    })
})
