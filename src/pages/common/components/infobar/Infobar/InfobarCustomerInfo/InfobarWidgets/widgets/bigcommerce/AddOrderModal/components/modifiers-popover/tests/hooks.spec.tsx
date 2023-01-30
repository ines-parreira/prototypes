import {renderHook} from 'react-hooks-testing-library'
import {waitFor} from '@testing-library/react'
import produce from 'immer'
import {
    bigCommerceProductFixture,
    bigCommerceVariantFixture,
} from 'fixtures/bigcommerce'
import {useModifiersPopover} from '../hooks'
import {useCanViewBigCommerceCreateOrderModifiers} from '../../../utils'

jest.mock('../../../utils', () => ({
    ...jest.requireActual<Record<string, unknown>>('../../../utils'),
    useCanViewBigCommerceCreateOrderModifiers: jest.fn(),
}))

const product = bigCommerceProductFixture()
const variant = bigCommerceVariantFixture()

describe('useModifiersPopover', () => {
    beforeEach(() =>
        (
            useCanViewBigCommerceCreateOrderModifiers as jest.MockedFunction<
                typeof useCanViewBigCommerceCreateOrderModifiers
            >
        ).mockImplementation(() => true)
    )

    it('returns component when maybeOpenModifierPopover is triggered', async () => {
        const onApplyMock = jest.fn()

        const {result} = renderHook(() =>
            useModifiersPopover('storeHash', onApplyMock)
        )

        // `modifiersPopover` components is `null` initially
        expect(result.current.modifiersPopover).toBeNull()

        expect(
            result.current.maybeOpenModifierPopover({product, variant})
        ).toBe(true)

        await waitFor(() => {
            expect(result.current.modifiersPopover).toBeTruthy()
        })
    })

    it('does not return component when maybeOpenModifierPopover is triggered but no LD flag', async () => {
        const onApplyMock = jest.fn()
        ;(
            useCanViewBigCommerceCreateOrderModifiers as jest.MockedFunction<
                typeof useCanViewBigCommerceCreateOrderModifiers
            >
        ).mockImplementationOnce(() => false)

        const {result} = renderHook(() =>
            useModifiersPopover('storeHash', onApplyMock)
        )

        expect(result.current.modifiersPopover).toBeNull()

        expect(
            result.current.maybeOpenModifierPopover({product, variant})
        ).toBe(false)

        await waitFor(() => {
            expect(result.current.modifiersPopover).toBeNull()
        })
    })

    it('does not return component when maybeOpenModifierPopover is triggered but no required modifiers', async () => {
        const onApplyMock = jest.fn()
        const productWithoutRequiredModifiers = produce(product, (draft) => {
            draft.modifiers = draft.modifiers.map((modifier) => ({
                ...modifier,
                required: false,
            }))
        })

        const {result} = renderHook(() =>
            useModifiersPopover('storeHash', onApplyMock)
        )

        expect(result.current.modifiersPopover).toBeNull()

        expect(
            result.current.maybeOpenModifierPopover({
                product: productWithoutRequiredModifiers,
                variant,
            })
        ).toBe(false)

        await waitFor(() => {
            expect(result.current.modifiersPopover).toBeNull()
        })
    })
})
