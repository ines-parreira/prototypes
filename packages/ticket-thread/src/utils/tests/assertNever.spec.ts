import { isProduction } from '@repo/utils'

import { assertNever } from '../assertNever'

vi.mock('@repo/utils', () => ({
    isProduction: vi.fn(),
}))

describe('assertNever', () => {
    it('throws in non-production environments', () => {
        vi.mocked(isProduction).mockReturnValue(false)

        const value = { _tag: 'unexpected' } as never

        expect(() => assertNever(value)).toThrow(
            'Unhandled discriminated union member: {"_tag":"unexpected"}',
        )
    })

    it('returns null in production', () => {
        vi.mocked(isProduction).mockReturnValue(true)

        const value = { _tag: 'unexpected' } as never

        expect(assertNever(value)).toBeNull()
    })
})
