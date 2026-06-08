import {
    GENERIC_ENABLE_SKILL_ERROR,
    getSkillEnableErrorMessage,
} from './useSkillEnableModal.utils'

jest.mock('models/api/types', () => ({
    isGorgiasApiError: jest.fn(),
}))

const { isGorgiasApiError } = jest.requireMock('models/api/types')

const buildApiError = (msg: string, status = 400) => ({
    response: { status, data: { error: { msg } } },
})

describe('getSkillEnableErrorMessage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns the generic message when the error is not a Gorgias API error', () => {
        isGorgiasApiError.mockReturnValue(false)

        expect(
            getSkillEnableErrorMessage(new Error('Network error'), 'My skill'),
        ).toBe(GENERIC_ENABLE_SKILL_ERROR)
    })

    it('surfaces a skill-friendly message for a duplicate title error', () => {
        isGorgiasApiError.mockReturnValue(true)
        const error = buildApiError(
            'An article with the title "Item is damaged" already exists in this help center',
        )

        expect(getSkillEnableErrorMessage(error, 'Item is damaged')).toBe(
            'Another resource with name "Item is damaged" already exists',
        )
    })

    it('surfaces a skill-friendly message for a duplicate content error', () => {
        isGorgiasApiError.mockReturnValue(true)
        const error = buildApiError(
            'An article with identical content already exists in this help center',
        )

        expect(getSkillEnableErrorMessage(error, 'My skill')).toBe(
            'Another resource with identical instructions already exists',
        )
    })

    it('surfaces the raw API message for other "already exists" errors', () => {
        isGorgiasApiError.mockReturnValue(true)
        const error = buildApiError('Something already exists somewhere')

        expect(getSkillEnableErrorMessage(error, 'My skill')).toBe(
            'Something already exists somewhere',
        )
    })

    it('formats trigger conflicts for 409 errors', () => {
        isGorgiasApiError.mockReturnValue(true)
        const error = buildApiError('order::cancel conflict', 409)

        expect(getSkillEnableErrorMessage(error, 'My skill')).toBe(
            'Order/cancel conflict',
        )
    })

    it('returns the generic message for non-409 API errors without a duplicate message', () => {
        isGorgiasApiError.mockReturnValue(true)
        const error = buildApiError('Some unexpected validation error', 400)

        expect(getSkillEnableErrorMessage(error, 'My skill')).toBe(
            GENERIC_ENABLE_SKILL_ERROR,
        )
    })
})
