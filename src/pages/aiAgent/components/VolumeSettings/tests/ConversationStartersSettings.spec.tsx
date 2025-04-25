import { ReactNode } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { ConversationStartersSettings } from '../ConversationStartersSettings'

type FormValues = {
    isConversationStartersEnabled: boolean
}

const Wrapper = ({
    children,
    defaultValues = { isConversationStartersEnabled: false },
}: {
    children: ReactNode
    defaultValues?: FormValues
}) => {
    const methods = useForm<FormValues>({ defaultValues })
    return <FormProvider {...methods}>{children}</FormProvider>
}

describe('ConversationStartersSettings', () => {
    it('renders the toggle with correct label and unchecked by default', () => {
        render(
            <Wrapper>
                <ConversationStartersSettings isEnabled={true} />
            </Wrapper>,
        )

        expect(screen.getByText('Conversation starters')).toBeInTheDocument()
        expect(
            screen.getByText('Enable conversation starters'),
        ).toBeInTheDocument()

        const toggle = screen.getByRole('switch')
        expect(toggle).not.toBeChecked()
    })

    it('shows the toggle as checked if value is true', () => {
        render(
            <Wrapper defaultValues={{ isConversationStartersEnabled: true }}>
                <ConversationStartersSettings isEnabled={true} />
            </Wrapper>,
        )

        expect(screen.getByRole('switch')).toBeChecked()
    })

    it('disables the toggle when isEnabled is false', () => {
        render(
            <Wrapper>
                <ConversationStartersSettings isEnabled={false} />
            </Wrapper>,
        )

        const toggle = screen.getByRole('switch')
        expect(toggle.className).toContain('disabled')
    })

    it('updates the value when toggled', () => {
        render(
            <Wrapper>
                <ConversationStartersSettings isEnabled={true} />
            </Wrapper>,
        )

        const toggle = screen.getByRole('switch')
        expect(toggle).not.toBeChecked()

        fireEvent.click(toggle)
        expect(toggle).toBeChecked()
    })
})
