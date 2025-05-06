import { ReactNode } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { ldClientMock } from 'jest-launchdarkly-mock'
import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter } from 'react-router'

import { getLDClient } from 'utils/launchDarkly'

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
    return (
        <MemoryRouter>
            <FormProvider {...methods}>{children}</FormProvider>
        </MemoryRouter>
    )
}

describe('ConversationStartersSettings', () => {
    beforeEach(() => {
        ldClientMock.allFlags.mockReturnValue({})
        let client = getLDClient()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        client = ldClientMock
    })

    it('renders the toggle with correct label and unchecked by default', () => {
        render(
            <Wrapper>
                <ConversationStartersSettings isEnabled={true} />
            </Wrapper>,
        )

        expect(
            screen.getByText('Suggested Product Questions'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Show up to 3 dynamic, AI-generated questions on product pages, based on what shoppers are most likely to ask, to resolve doubts quickly and drive more conversions.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Unlock up to ~5% additional GMV'),
        ).toBeInTheDocument()
        expect(
            screen.getByAltText(
                'image showing an example of the conversation starters',
            ),
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
