import type { ReactNode } from 'react'

import { getLDClient } from '@repo/feature-flags'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ldClientMock } from 'jest-launchdarkly-mock'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
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

const notOnDialog = (el: HTMLElement) => !el.closest('[role="dialog"]')

type FormValues = {
    isConversationStartersEnabled: boolean
    isConversationStartersDesktopOnly: boolean
}

const FormValuesDisplay = () => {
    const { watch } = useFormContext<FormValues>()
    const values = watch()
    return <div data-testid="form-values">{JSON.stringify(values)}</div>
}

const Wrapper = ({
    children,
    defaultValues = {
        isConversationStartersEnabled: false,
        isConversationStartersDesktopOnly: false,
    },
}: {
    children: ReactNode
    defaultValues?: FormValues
}) => {
    const methods = useForm<FormValues>({ defaultValues })
    return (
        <MemoryRouter>
            <FormProvider {...methods}>
                {children}
                <FormValuesDisplay />
            </FormProvider>
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

        screen.getAllByText('AI FAQs: Floating above chat').find(notOnDialog)

        screen
            .getAllByText(
                'Show up to 3 AI-generated questions above chat to answer common shopper questions and start conversations.',
            )
            .find(notOnDialog)
        screen
            .getAllByText('Unlock up to 0.17% additional GMV')
            .find(notOnDialog)
        screen.getByAltText(
            'image showing an example of the conversation starters',
        )

        const toggle = screen.getByRole('switch')
        expect(toggle).not.toBeChecked()
    })

    it('shows the toggle as checked if value is true', () => {
        render(
            <Wrapper
                defaultValues={{
                    isConversationStartersEnabled: true,
                    isConversationStartersDesktopOnly: false,
                }}
            >
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

    it('opens the drawer when toggling on', async () => {
        const user = userEvent.setup()

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
        await user.click(toggle)

        screen.getAllByText('AI FAQs: Floating above chat').find(notOnDialog)

        screen.getByText('Enable AI FAQs')
        screen.getByLabelText('Hide on mobile')
    })

    it('opens the drawer when clicking the toggle while enabled', async () => {
        const user = userEvent.setup()

        render(
            <Wrapper
                defaultValues={{
                    isConversationStartersEnabled: true,
                    isConversationStartersDesktopOnly: true,
                }}
            >
                <ConversationStartersSettings
                    isEnabled={true}
                    isGmvLoading={false}
                    gmv={[]}
                />
            </Wrapper>,
        )

        const toggle = screen.getByRole('switch')
        await user.click(toggle)

        expect(toggle).toBeChecked()
        screen.getByText('Enable AI FAQs')
    })

    it('opens the drawer when clicking settings icon', async () => {
        const user = userEvent.setup()

        render(
            <Wrapper
                defaultValues={{
                    isConversationStartersEnabled: true,
                    isConversationStartersDesktopOnly: false,
                }}
            >
                <ConversationStartersSettings
                    isEnabled={true}
                    isGmvLoading={false}
                    gmv={[]}
                />
            </Wrapper>,
        )

        const settingsButton = screen.getByLabelText('Open settings')
        await user.click(settingsButton)

        screen.getByLabelText('AI FAQs: Floating above chat')
    })

    it('shows Desktop only badge when isConversationStartersDesktopOnly is true and enabled', () => {
        render(
            <Wrapper
                defaultValues={{
                    isConversationStartersEnabled: true,
                    isConversationStartersDesktopOnly: true,
                }}
            >
                <ConversationStartersSettings
                    isEnabled={true}
                    isGmvLoading={false}
                    gmv={[]}
                />
            </Wrapper>,
        )

        screen.getByText('Desktop only')
    })

    it('does not show Desktop only badge when isConversationStartersDesktopOnly is false', () => {
        render(
            <Wrapper
                defaultValues={{
                    isConversationStartersEnabled: true,
                    isConversationStartersDesktopOnly: false,
                }}
            >
                <ConversationStartersSettings
                    isEnabled={true}
                    isGmvLoading={false}
                    gmv={[]}
                />
            </Wrapper>,
        )

        expect(screen.queryByText('Desktop only')).not.toBeInTheDocument()
    })

    it('updates parent form values when clicking Update in the drawer', async () => {
        const user = userEvent.setup()
        const onAdvancedSettingsSave = jest.fn()

        render(
            <Wrapper>
                <ConversationStartersSettings
                    isEnabled={true}
                    isGmvLoading={false}
                    gmv={[]}
                    onAdvancedSettingsSave={onAdvancedSettingsSave}
                />
            </Wrapper>,
        )

        const toggle = screen.getByRole('switch')
        await user.click(toggle)

        screen.getByText('Enable AI FAQs')

        await user.click(screen.getByLabelText('Hide on mobile'))

        const updateButton = screen.getByRole('button', { name: 'Update' })
        await user.click(updateButton)

        await waitFor(() => {
            const formValues = JSON.parse(
                screen.getByTestId('form-values').textContent!,
            )
            expect(formValues.isConversationStartersEnabled).toBe(true)
            expect(formValues.isConversationStartersDesktopOnly).toBe(true)
        })
        expect(onAdvancedSettingsSave).toHaveBeenCalled()
    })

    describe('drawer coupled toggle logic', () => {
        it('resets isDesktopOnly to false when unchecking Hide on mobile in drawer', async () => {
            const user = userEvent.setup()

            render(
                <Wrapper
                    defaultValues={{
                        isConversationStartersEnabled: true,
                        isConversationStartersDesktopOnly: true,
                    }}
                >
                    <ConversationStartersSettings
                        isEnabled={true}
                        isGmvLoading={false}
                        gmv={[]}
                    />
                </Wrapper>,
            )

            const settingsButton = screen.getByLabelText('Open settings')
            await user.click(settingsButton)

            await user.click(screen.getByLabelText('Hide on mobile'))

            const updateButton = screen.getByRole('button', { name: 'Update' })
            await user.click(updateButton)

            await waitFor(() => {
                const formValues = JSON.parse(
                    screen.getByTestId('form-values').textContent!,
                )
                expect(formValues.isConversationStartersEnabled).toBe(true)
                expect(formValues.isConversationStartersDesktopOnly).toBe(false)
            })
        })

        it('forces isEnabled to true when checking Hide on mobile', async () => {
            const user = userEvent.setup()

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
            await user.click(toggle)

            await user.click(screen.getByLabelText('Hide on mobile'))

            const updateButton = screen.getByRole('button', { name: 'Update' })
            await user.click(updateButton)

            await waitFor(() => {
                const formValues = JSON.parse(
                    screen.getByTestId('form-values').textContent!,
                )
                expect(formValues.isConversationStartersEnabled).toBe(true)
                expect(formValues.isConversationStartersDesktopOnly).toBe(true)
            })
        })
    })

    describe('drawer cancel and close', () => {
        it('closes the drawer when clicking Cancel', async () => {
            const user = userEvent.setup()

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
            await user.click(toggle)

            const drawer = screen.getByRole('dialog')
            expect(drawer).not.toHaveAttribute('hidden')

            await user.click(screen.getByRole('button', { name: 'Cancel' }))

            await waitFor(() => {
                expect(drawer).toHaveAttribute('hidden')
            })
        })

        it('does not update form values when cancelling', async () => {
            const user = userEvent.setup()

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
            await user.click(toggle)

            const drawerToggle = screen.getAllByRole('switch')[1]
            await user.click(drawerToggle)

            await user.click(screen.getByRole('button', { name: 'Cancel' }))

            const formValues = JSON.parse(
                screen.getByTestId('form-values').textContent!,
            )
            expect(formValues.isConversationStartersEnabled).toBe(false)
            expect(formValues.isConversationStartersDesktopOnly).toBe(false)
        })
    })
})
