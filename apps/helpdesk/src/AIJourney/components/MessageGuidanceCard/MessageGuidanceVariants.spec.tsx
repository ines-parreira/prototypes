import type { ReactNode } from 'react'

import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { MessageGuidanceVariants } from './MessageGuidanceVariants'
import type { MessageInstructionsVariant } from './types'

type FormDefaults = {
    message_instructions?: string
    variants?: MessageInstructionsVariant[]
}

const renderVariants = (defaultValues: FormDefaults = {}) => {
    const FormWrapper = ({ children }: { children: ReactNode }) => {
        const methods = useForm<FormDefaults>({
            defaultValues: {
                message_instructions: '',
                variants: [],
                ...defaultValues,
            },
        })
        return <FormProvider {...methods}>{children}</FormProvider>
    }
    return render(<MessageGuidanceVariants />, { wrapper: FormWrapper })
}

describe('<MessageGuidanceVariants />', () => {
    it('renders the Control card with the computed weight from the variants', () => {
        renderVariants({
            variants: [
                { id: 'v1', message_instructions: 'a', weight: 20 },
                { id: 'v2', message_instructions: 'b', weight: 30 },
            ],
        })

        expect(screen.getByText(/Control · 50%/)).toBeInTheDocument()
        expect(screen.getByText(/Variant 1 · 20%/)).toBeInTheDocument()
        expect(screen.getByText(/Variant 2 · 30%/)).toBeInTheDocument()
    })

    it('shows a per-variant remaining character count', () => {
        renderVariants({
            variants: [
                {
                    id: 'v1',
                    message_instructions: 'Hello',
                    weight: 25,
                },
            ],
        })

        // Control textarea (empty) and Variant 1 textarea ("Hello", 5 chars)
        expect(
            screen.getByText('4000 characters remaining'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('3995 characters remaining'),
        ).toBeInTheDocument()
    })

    it('appends a new variant when "Add variant" is clicked', async () => {
        const user = userEvent.setup()
        renderVariants({
            variants: [{ id: 'v1', message_instructions: 'a', weight: 20 }],
        })

        await user.click(screen.getByRole('button', { name: /add variant/i }))

        expect(screen.getByText(/Variant 2 ·/)).toBeInTheDocument()
        // 100 - 1 (control min) - 20 (variant 1) = 79 remaining, capped at 10
        expect(screen.getByText(/Variant 2 · 10%/)).toBeInTheDocument()
        expect(screen.getByText(/Control · 70%/)).toBeInTheDocument()
    })

    it('disables the "Add variant" button when no headroom remains', () => {
        renderVariants({
            variants: [{ id: 'v1', message_instructions: 'a', weight: 99 }],
        })

        expect(
            screen.getByRole('button', { name: /add variant/i }),
        ).toBeDisabled()
    })

    it('removes a variant when its trash button is clicked', async () => {
        const user = userEvent.setup()
        renderVariants({
            variants: [
                { id: 'v1', message_instructions: 'a', weight: 20 },
                { id: 'v2', message_instructions: 'b', weight: 30 },
            ],
        })

        await user.click(
            screen.getByRole('button', { name: /remove variant 1/i }),
        )

        expect(screen.queryByText(/Variant 2/)).not.toBeInTheDocument()
        // The remaining variant becomes Variant 1, with the surviving weight
        expect(screen.getByText(/Variant 1 · 30%/)).toBeInTheDocument()
        expect(screen.getByText(/Control · 70%/)).toBeInTheDocument()
    })

    it('clamps a variant weight so the control stays at least 1%', async () => {
        const user = userEvent.setup()
        renderVariants({
            variants: [
                { id: 'v1', message_instructions: 'a', weight: 50 },
                { id: 'v2', message_instructions: 'b', weight: 30 },
            ],
        })

        const variant2Heading = screen.getByText(/Variant 2 · 30%/)
        const variant2Container = variant2Heading.closest('div')!.parentElement!
        const weightInput = within(variant2Container).getByRole('textbox', {
            name: /weight/i,
        })

        await user.clear(weightInput)
        await user.type(weightInput, '90')
        await user.tab()

        // Other variants sum to 50, control needs ≥1, so max for variant 2 is 49
        expect(screen.getByText(/Variant 2 · 49%/)).toBeInTheDocument()
        expect(screen.getByText(/Control · 1%/)).toBeInTheDocument()
    })
})
