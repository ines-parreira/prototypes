import { render } from '@repo/testing'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { MessageInstructionsVariant } from 'AIJourney/components/MessageGuidanceCard/types'

import {
    buildGuidanceVariantOptions,
    CONTROL_SELECTION,
    getGuidanceInstructionsForSelection,
    resolveGuidanceSelection,
    TestGuidanceVariantSelect,
    WEIGHTED_SELECTION,
} from './TestGuidanceVariantSelect'

const variants: MessageInstructionsVariant[] = [
    { id: 'uuid-1', message_instructions: 'Variant one guidance', weight: 30 },
    { id: 'uuid-2', message_instructions: 'Variant two guidance', weight: 20 },
]

describe('buildGuidanceVariantOptions', () => {
    it('builds Control + Variant labels without weighted by default', () => {
        expect(buildGuidanceVariantOptions(variants, false)).toEqual([
            { id: CONTROL_SELECTION, label: 'Control' },
            { id: 'uuid-1', label: 'Variant 1' },
            { id: 'uuid-2', label: 'Variant 2' },
        ])
    })

    it('prepends the weighted option when requested', () => {
        expect(buildGuidanceVariantOptions(variants, true)).toEqual([
            { id: WEIGHTED_SELECTION, label: 'Weighted (random by A/B split)' },
            { id: CONTROL_SELECTION, label: 'Control' },
            { id: 'uuid-1', label: 'Variant 1' },
            { id: 'uuid-2', label: 'Variant 2' },
        ])
    })
})

describe('resolveGuidanceSelection', () => {
    it('keeps a valid selection', () => {
        expect(resolveGuidanceSelection('uuid-2', variants, false)).toBe(
            'uuid-2',
        )
    })

    it('falls back to Control when the selection is stale (preview)', () => {
        expect(resolveGuidanceSelection('uuid-removed', variants, false)).toBe(
            CONTROL_SELECTION,
        )
    })

    it('falls back to Weighted when the selection is stale (sms)', () => {
        expect(resolveGuidanceSelection('uuid-removed', variants, true)).toBe(
            WEIGHTED_SELECTION,
        )
    })
})

describe('getGuidanceInstructionsForSelection', () => {
    it('returns the control instructions for Control', () => {
        expect(
            getGuidanceInstructionsForSelection(
                CONTROL_SELECTION,
                'control guidance',
                variants,
            ),
        ).toBe('control guidance')
    })

    it('returns the control instructions for Weighted', () => {
        expect(
            getGuidanceInstructionsForSelection(
                WEIGHTED_SELECTION,
                'control guidance',
                variants,
            ),
        ).toBe('control guidance')
    })

    it('returns the variant instructions for a selected variant', () => {
        expect(
            getGuidanceInstructionsForSelection(
                'uuid-2',
                'control guidance',
                variants,
            ),
        ).toBe('Variant two guidance')
    })

    it('falls back to control instructions for a stale variant', () => {
        expect(
            getGuidanceInstructionsForSelection(
                'uuid-removed',
                'control guidance',
                variants,
            ),
        ).toBe('control guidance')
    })
})

describe('<TestGuidanceVariantSelect />', () => {
    it('emits the selected option id when an option is chosen', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()

        render(
            <TestGuidanceVariantSelect
                variants={variants}
                value={CONTROL_SELECTION}
                onChange={onChange}
            />,
        )

        await user.click(screen.getByRole('button', { name: /control/i }))

        const listbox = await screen.findByRole('listbox')
        await user.click(
            within(listbox).getByRole('option', { name: 'Variant 1' }),
        )

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith('uuid-1')
        })
    })

    it('renders the Weighted option only when includeWeighted is set', async () => {
        const user = userEvent.setup()

        render(
            <TestGuidanceVariantSelect
                variants={variants}
                value={WEIGHTED_SELECTION}
                onChange={jest.fn()}
                includeWeighted
            />,
        )

        await user.click(screen.getByRole('button', { name: /weighted/i }))

        const listbox = await screen.findByRole('listbox')
        expect(
            within(listbox).getByRole('option', {
                name: 'Weighted (random by A/B split)',
            }),
        ).toBeInTheDocument()
    })

    it('reveals the info tooltip with the provided text on hover', async () => {
        const user = userEvent.setup()

        render(
            <TestGuidanceVariantSelect
                variants={variants}
                value={CONTROL_SELECTION}
                onChange={jest.fn()}
                infoTooltip="Choose which guidance variant to preview."
            />,
        )

        await user.hover(
            screen.getByRole('img', { name: /message guidance information/i }),
        )

        const tooltip = await screen.findByRole('tooltip')
        expect(tooltip).toHaveTextContent(
            'Choose which guidance variant to preview.',
        )
    })

    it('does not render an info affordance when infoTooltip is omitted', () => {
        render(
            <TestGuidanceVariantSelect
                variants={variants}
                value={CONTROL_SELECTION}
                onChange={jest.fn()}
            />,
        )

        expect(
            screen.queryByRole('img', {
                name: /message guidance information/i,
            }),
        ).not.toBeInTheDocument()
    })
})
