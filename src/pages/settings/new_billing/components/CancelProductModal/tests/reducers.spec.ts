import {CommonReasonLabel} from '../constants'
import {cancellationReasonsReducer, DEFAULT_STATE} from '../reducers'
import {CancellationReasonsActionType} from '../types'

describe('cancellationReasonsReducer', () => {
    it('should update the primary reason and keep the state uncompleted', () => {
        expect(
            cancellationReasonsReducer(DEFAULT_STATE, {
                type: CancellationReasonsActionType.PrimaryReasonSelected,
                primaryReason: {label: 'primary'},
            })
        ).toEqual({
            primaryReason: {label: 'primary'},
            secondaryReason: null,
            otherReason: null,
            completed: false,
        })
    })

    it('should update the secondary reason and return the completed state', () => {
        const primaryReason = {label: 'primary'}
        const secondaryReason = {label: 'secondary'}
        expect(
            cancellationReasonsReducer(
                {
                    ...DEFAULT_STATE,
                    primaryReason: primaryReason,
                },
                {
                    type: CancellationReasonsActionType.SecondaryReasonSelected,
                    secondaryReason: secondaryReason,
                }
            )
        ).toEqual({
            primaryReason: primaryReason,
            secondaryReason: secondaryReason,
            otherReason: null,
            completed: true,
        })
    })

    it('should update the secondary reason with "Other" and return the state uncompleted', () => {
        const primaryReason = {label: 'primary'}
        const secondaryReason = {label: CommonReasonLabel.Other}
        expect(
            cancellationReasonsReducer(
                {
                    ...DEFAULT_STATE,
                    primaryReason: primaryReason,
                },
                {
                    type: CancellationReasonsActionType.SecondaryReasonSelected,
                    secondaryReason: secondaryReason,
                }
            )
        ).toEqual({
            primaryReason: primaryReason,
            secondaryReason: secondaryReason,
            otherReason: null,
            completed: false,
        })
    })

    it('should update the primary reason with "I prefer not to say" and return the completed state', () => {
        expect(
            cancellationReasonsReducer(DEFAULT_STATE, {
                type: CancellationReasonsActionType.PrimaryReasonSelected,
                primaryReason: {label: CommonReasonLabel.IPreferNotToSay},
            })
        ).toEqual({
            primaryReason: {label: CommonReasonLabel.IPreferNotToSay},
            secondaryReason: null,
            otherReason: null,
            completed: true,
        })
    })

    it('should update the other reason for existing "Other" primary reason and return a completed state', () => {
        const primaryReason = {label: CommonReasonLabel.Other}
        const otherReason = {label: 'other reason'}
        expect(
            cancellationReasonsReducer(
                {
                    ...DEFAULT_STATE,
                    primaryReason: primaryReason,
                },
                {
                    type: CancellationReasonsActionType.OtherReasonUpdated,
                    otherReason: otherReason,
                }
            )
        ).toEqual({
            primaryReason: {label: CommonReasonLabel.Other},
            secondaryReason: null,
            otherReason: otherReason,
            completed: true,
        })
    })

    it('should update the other reason for existing "Other" primary reason and return a completed state', () => {
        expect(
            cancellationReasonsReducer(
                {
                    ...DEFAULT_STATE,
                    primaryReason: {label: CommonReasonLabel.Other},
                },
                {
                    type: CancellationReasonsActionType.OtherReasonUpdated,
                    otherReason: {label: 'Some other reason'},
                }
            )
        ).toEqual({
            primaryReason: {label: CommonReasonLabel.Other},
            secondaryReason: null,
            otherReason: {label: 'Some other reason'},
            completed: true,
        })
    })

    it('should update the other reason for existing "Other" primary reason and return a completed state', () => {
        expect(
            cancellationReasonsReducer(
                {
                    ...DEFAULT_STATE,
                    primaryReason: {label: CommonReasonLabel.Other},
                },
                {
                    type: CancellationReasonsActionType.OtherReasonUpdated,
                    otherReason: {label: 'Some other reason'},
                }
            )
        ).toEqual({
            primaryReason: {label: CommonReasonLabel.Other},
            secondaryReason: null,
            otherReason: {label: 'Some other reason'},
            completed: true,
        })
    })

    it('should reset the state to default', () => {
        expect(
            cancellationReasonsReducer(
                {
                    ...DEFAULT_STATE,
                    primaryReason: {label: 'primary'},
                    secondaryReason: {label: 'secondary'},
                    otherReason: {label: 'other'},
                    completed: true,
                },
                {
                    type: CancellationReasonsActionType.Reset,
                }
            )
        ).toEqual(DEFAULT_STATE)
    })
})
