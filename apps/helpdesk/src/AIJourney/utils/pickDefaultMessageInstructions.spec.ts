import { JOURNEY_TYPES } from 'AIJourney/constants'

import { pickDefaultMessageInstructions } from './pickDefaultMessageInstructions'

describe('pickDefaultMessageInstructions', () => {
    const baseArgs = {
        journeyMessageInstructions: undefined,
        isStructuredEditorEnabled: true,
        initialMessageInstructionsFromState: undefined,
        journeyType: undefined as JOURNEY_TYPES | undefined,
    }

    it('returns the existing journey value when present, regardless of other inputs', () => {
        expect(
            pickDefaultMessageInstructions({
                ...baseArgs,
                journeyMessageInstructions: 'existing content',
                initialMessageInstructionsFromState: 'from picker',
                journeyType: JOURNEY_TYPES.WELCOME,
            }),
        ).toBe('existing content')
    })

    it('returns empty when the structured editor flag is off and no explicit prefill is set', () => {
        expect(
            pickDefaultMessageInstructions({
                ...baseArgs,
                isStructuredEditorEnabled: false,
                journeyType: JOURNEY_TYPES.WELCOME,
            }),
        ).toBe('')
    })

    it('honors an explicit location.state prefill even when the structured editor flag is off', () => {
        expect(
            pickDefaultMessageInstructions({
                ...baseArgs,
                isStructuredEditorEnabled: false,
                initialMessageInstructionsFromState: 'from picker',
                journeyType: JOURNEY_TYPES.WELCOME,
            }),
        ).toBe('from picker')
    })

    it('returns the location.state prefill when set (campaign created via picker)', () => {
        expect(
            pickDefaultMessageInstructions({
                ...baseArgs,
                initialMessageInstructionsFromState: 'from picker',
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            }),
        ).toBe('from picker')
    })

    it('returns empty for non-campaign journey types while flow templates content is unavailable', () => {
        expect(
            pickDefaultMessageInstructions({
                ...baseArgs,
                journeyType: JOURNEY_TYPES.WELCOME,
            }),
        ).toBe('')
    })

    it('returns empty for the campaign journey type (no auto template)', () => {
        expect(
            pickDefaultMessageInstructions({
                ...baseArgs,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            }),
        ).toBe('')
    })

    it('returns empty for custom flows (no template defined)', () => {
        expect(
            pickDefaultMessageInstructions({
                ...baseArgs,
                journeyType: JOURNEY_TYPES.CUSTOM,
            }),
        ).toBe('')
    })

    it('returns empty when journeyType is undefined', () => {
        expect(pickDefaultMessageInstructions(baseArgs)).toBe('')
    })

    it('prioritizes location.state over the flow template fallback', () => {
        expect(
            pickDefaultMessageInstructions({
                ...baseArgs,
                initialMessageInstructionsFromState: 'from picker',
                journeyType: JOURNEY_TYPES.WELCOME,
            }),
        ).toBe('from picker')
    })

    it('treats empty journeyMessageInstructions as missing and falls through', () => {
        expect(
            pickDefaultMessageInstructions({
                ...baseArgs,
                journeyMessageInstructions: '',
                initialMessageInstructionsFromState: 'from picker',
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            }),
        ).toBe('from picker')
    })
})
