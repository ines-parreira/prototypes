import type { ReactNode } from 'react'

import { ldClientMock } from '@repo/feature-flags/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter } from 'react-router-dom'

import { TriggerOnSearchSettings } from '../TriggerOnSearchSettings'

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
    isSalesHelpOnSearchEnabled: boolean
}

const Wrapper = ({
    children,
    defaultValues = { isSalesHelpOnSearchEnabled: false },
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

describe('TriggerOnSearchSettings', () => {
    beforeEach(() => {
        ldClientMock.allFlags.mockReturnValue({})
    })

    it('renders the toggle with correct label and unchecked by default', () => {
        render(
            <Wrapper>
                <TriggerOnSearchSettings isGmvLoading={false} gmv={[]} />
            </Wrapper>,
        )

        expect(screen.getByText('Search assist')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Send a personalized message right after a shopper searches to guide them to the right product and drive more conversions.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Unlock up to 0.04% additional GMV'),
        ).toBeInTheDocument()
        expect(
            screen.getByAltText(
                'image showing an example of the Search assist',
            ),
        ).toBeInTheDocument()

        const toggle = screen.getByRole('switch')
        expect(toggle).not.toBeChecked()
    })

    it('shows the toggle as checked if value is true', () => {
        render(
            <Wrapper defaultValues={{ isSalesHelpOnSearchEnabled: true }}>
                <TriggerOnSearchSettings isGmvLoading={false} gmv={[]} />
            </Wrapper>,
        )

        expect(screen.getByRole('switch')).toBeChecked()
    })

    it('updates the value when toggled', () => {
        render(
            <Wrapper>
                <TriggerOnSearchSettings isGmvLoading={false} gmv={[]} />
            </Wrapper>,
        )

        const toggle = screen.getByRole('switch')
        expect(toggle).not.toBeChecked()

        fireEvent.click(toggle)
        expect(toggle).toBeChecked()
    })

    it('should disable the toggle', () => {
        render(
            <Wrapper>
                <TriggerOnSearchSettings
                    isGmvLoading={false}
                    gmv={[]}
                    isDisabled
                />
            </Wrapper>,
        )

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeDisabled()
    })

    it('should disable the toggle and be unchecked even if enabled in store settings', () => {
        render(
            <Wrapper defaultValues={{ isSalesHelpOnSearchEnabled: true }}>
                <TriggerOnSearchSettings
                    isGmvLoading={false}
                    gmv={[]}
                    isDisabled
                />
            </Wrapper>,
        )

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeDisabled()
        expect(checkbox).not.toBeChecked()
    })
})
