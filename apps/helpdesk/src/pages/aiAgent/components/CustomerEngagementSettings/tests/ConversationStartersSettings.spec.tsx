import type { ReactNode } from 'react'

import { getLDClient } from '@repo/feature-flags'
import { fireEvent, render, screen } from '@testing-library/react'
import { ldClientMock } from 'jest-launchdarkly-mock'
import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter } from 'react-router-dom'

import { ConversationStartersSettings } from '../ConversationStartersSettings'

jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/usePotentialImpact',
    () => {
        return {
            usePotentialImpact: jest.fn(
                (coefficient: number) =>
                    `Unlock up to ${coefficient}% additional GMV`,
            ),
        }
    },
)

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
        let __client = getLDClient()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __client = ldClientMock
    })

    it('renders the toggle with correct label and unchecked by default', () => {
        render(
            <Wrapper>
                <ConversationStartersSettings
                    isEnabled={true}
                    isGmvLoading={false}
                    gmv={[]}
                />
            </Wrapper>,
        )

        expect(
            screen.getByText('AI FAQs: Floating above chat'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Show up to 3 AI-generated questions above chat to answer common shopper questions and start conversations.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Unlock up to 0.17% additional GMV'),
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
                <ConversationStartersSettings
                    isEnabled={true}
                    isGmvLoading={false}
                    gmv={[]}
                />
            </Wrapper>,
        )

        expect(screen.getByRole('switch')).toBeChecked()
    })

    it('disables the toggle when isEnabled is false', () => {
        render(
            <Wrapper>
                <ConversationStartersSettings
                    isEnabled={false}
                    isGmvLoading={false}
                    gmv={[]}
                />
            </Wrapper>,
        )

        const toggle = screen.getByRole('switch')
        expect(toggle.className).toContain('disabled')
    })

    it('updates the value when toggled', () => {
        render(
            <Wrapper>
                <ConversationStartersSettings
                    isEnabled={true}
                    isGmvLoading={false}
                    gmv={[]}
                />
            </Wrapper>,
        )

        const toggle = screen.getByRole('switch')
        expect(toggle).not.toBeChecked()

        fireEvent.click(toggle)
        expect(toggle).toBeChecked()
    })
})
