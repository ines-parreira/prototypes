import { renderHook } from '@repo/testing'

import useFindChurnMitigationOfferId from '../useFindChurnMitigationOffer'

describe('useFindChurnMitigationOfferId', () => {
    const reasonsToCanduContents = [
        {
            primaryReasonLabel: 'reason1',
            secondaryReasonLabel: 'reason2',
            canduContentID: 'content1',
        },
        {
            primaryReasonLabel: 'reason3',
            secondaryReasonLabel: 'reason4',
            canduContentID: 'content2',
        },
    ]
    it('should return null when primaryReason and secondaryReason are null', () => {
        const { result } = renderHook(() =>
            useFindChurnMitigationOfferId(null, null, reasonsToCanduContents),
        )

        expect(result.current).toBeNull()
    })

    it('should return null when no matching reason is found', () => {
        const { result } = renderHook(() =>
            useFindChurnMitigationOfferId(
                { label: 'nonexistent1' },
                { label: 'nonexistent2' },
                reasonsToCanduContents,
            ),
        )

        expect(result.current).toBeNull()
    })

    it('should return canduContentID when matching reason is found', () => {
        const { result } = renderHook(() =>
            useFindChurnMitigationOfferId(
                { label: 'reason1' },
                { label: 'reason2' },
                reasonsToCanduContents,
            ),
        )

        expect(result.current).toBe('content1')
    })
})
