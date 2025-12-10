import { cancellationReasonsReducer, DEFAULT_STATE } from '../reducers'
import { CancellationReasonsActionType } from '../types'

describe('cancellationReasonsReducer', () => {
    it('should update the primary reason and keep the state uncompleted', () => {
        expect(
            cancellationReasonsReducer(DEFAULT_STATE, {
                type: CancellationReasonsActionType.PrimaryReasonSelected,
                primaryReason: { label: 'primary' },
            }),
        ).toEqual({
            primaryReason: { label: 'primary' },
            secondaryReason: null,
            additionalDetails: null,
            completed: false,
        })
    })

    it('should update the secondary reason and return the completed state', () => {
        const primaryReason = { label: 'primary' }
        const secondaryReason = { label: 'secondary' }
        expect(
            cancellationReasonsReducer(
                {
                    ...DEFAULT_STATE,
                    primaryReason: primaryReason,
                },
                {
                    type: CancellationReasonsActionType.SecondaryReasonSelected,
                    secondaryReason: secondaryReason,
                },
            ),
        ).toEqual({
            primaryReason: primaryReason,
            secondaryReason: secondaryReason,
            additionalDetails: null,
            completed: true,
        })
    })

    it('should update additional details without affecting completion state', () => {
        const primaryReason = { label: 'primary' }
        const secondaryReason = { label: 'secondary' }
        const additionalDetails = { label: 'Some additional context' }

        expect(
            cancellationReasonsReducer(
                {
                    ...DEFAULT_STATE,
                    primaryReason: primaryReason,
                    secondaryReason: secondaryReason,
                    completed: true,
                },
                {
                    type: CancellationReasonsActionType.AdditionalDetailsUpdated,
                    additionalDetails: additionalDetails,
                },
            ),
        ).toEqual({
            primaryReason: primaryReason,
            secondaryReason: secondaryReason,
            additionalDetails: additionalDetails,
            completed: true,
        })
    })

    it('should reset the state to default', () => {
        expect(
            cancellationReasonsReducer(
                {
                    ...DEFAULT_STATE,
                    primaryReason: { label: 'primary' },
                    secondaryReason: { label: 'secondary' },
                    additionalDetails: { label: 'details' },
                    completed: true,
                },
                {
                    type: CancellationReasonsActionType.Reset,
                },
            ),
        ).toEqual(DEFAULT_STATE)
    })
})
