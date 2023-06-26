import {renderHook} from '@testing-library/react-hooks'
import {waitFor} from '@testing-library/react'
import {produce} from 'immer'
import {
    bigCommerceLineItemFixture,
    bigCommerceProductFixture,
    bigCommerceVariantFixture,
} from 'fixtures/bigcommerce'
import {useAddModifiersPopover, useEditModifiersPopover} from '../hooks'

jest.mock('../../../utils', () => ({
    ...jest.requireActual<Record<string, unknown>>('../../../utils'),
    useCanViewBigCommerceCreateOrderModifiers: jest.fn(),
}))

const product = bigCommerceProductFixture()
const variant = bigCommerceVariantFixture()

describe('useModifiersPopover', () => {
    it('returns component when maybeOpenModifierPopover is triggered', async () => {
        const onApplyMock = jest.fn()

        const {result} = renderHook(() =>
            useAddModifiersPopover('storeHash', onApplyMock)
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

    it('does not return component when maybeOpenModifierPopover is triggered but no required modifiers', async () => {
        const onApplyMock = jest.fn()
        const productWithoutRequiredModifiers = produce(product, (draft) => {
            draft.modifiers = (draft.modifiers ?? []).map((modifier) => ({
                ...modifier,
                required: false,
            }))
        })

        const {result} = renderHook(() =>
            useAddModifiersPopover('storeHash', onApplyMock)
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

describe('useEditModifiersPopover', () => {
    it('returns component when openModifierPopover is triggered', async () => {
        const onApplyMock = jest.fn()

        const {result} = renderHook(() =>
            useEditModifiersPopover('storeHash', onApplyMock)
        )

        // `modifiersPopover` components is `null` initially
        expect(result.current.modifiersPopover).toBeNull()

        result.current.openModifierPopover({
            product,
            lineItem: bigCommerceLineItemFixture(),
        })

        await waitFor(() => {
            expect(result.current.modifiersPopover).toBeTruthy()
        })
    })
})
