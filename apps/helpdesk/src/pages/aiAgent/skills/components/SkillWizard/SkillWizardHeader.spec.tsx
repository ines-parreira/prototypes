import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'

import type { SkillWizardContextValue } from './SkillWizardContext'
import { SkillWizardContext } from './SkillWizardContext'
import { SkillWizardHeader } from './SkillWizardHeader'

const buildContext = (
    overrides: Partial<SkillWizardContextValue> = {},
): SkillWizardContextValue => ({
    currentStep: 1,
    totalSteps: 10,
    reviewStepsCount: 9,
    isFirstStep: true,
    isLastStep: false,
    isRecapStep: false,
    goNext: jest.fn(),
    goBack: jest.fn(),
    goToStep: jest.fn(),
    onTest: jest.fn(),
    ...overrides,
})

const renderHeader = ({
    context,
    isSaving,
    onClose = jest.fn(),
}: {
    context: SkillWizardContextValue
    isSaving?: boolean
    onClose?: () => void
}) =>
    render(
        <ThemeProvider>
            <SkillWizardContext.Provider value={context}>
                <SkillWizardHeader isSaving={isSaving} onClose={onClose} />
            </SkillWizardContext.Provider>
        </ThemeProvider>,
    )

describe('SkillWizardHeader', () => {
    describe('on a review step', () => {
        it('shows the review title, progress label, and CTAs', () => {
            renderHeader({
                context: buildContext({
                    currentStep: 5,
                    isFirstStep: false,
                }),
            })

            expect(
                screen.getByRole('heading', { name: 'Review skill' }),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Reviewing draft 5 of 9'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Test' }),
            ).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /Back$/ })).toBeEnabled()
            expect(screen.getByRole('button', { name: /^Next/ })).toBeEnabled()
        })

        it('disables Back on the first step and Next on the last review step', () => {
            const { rerender } = renderHeader({
                context: buildContext({ currentStep: 1, isFirstStep: true }),
            })
            expect(screen.getByRole('button', { name: /Back$/ })).toBeDisabled()

            rerender(
                <ThemeProvider>
                    <SkillWizardContext.Provider
                        value={buildContext({
                            currentStep: 9,
                            isFirstStep: false,
                            isLastStep: false,
                        })}
                    >
                        <SkillWizardHeader onClose={jest.fn()} />
                    </SkillWizardContext.Provider>
                </ThemeProvider>,
            )
            expect(screen.getByRole('button', { name: /^Next/ })).toBeEnabled()
        })

        it('shows Saving indicator only when isSaving is true', () => {
            const { rerender } = renderHeader({
                context: buildContext({ currentStep: 3, isFirstStep: false }),
                isSaving: false,
            })
            expect(screen.queryByText('Saving')).not.toBeInTheDocument()

            rerender(
                <ThemeProvider>
                    <SkillWizardContext.Provider
                        value={buildContext({
                            currentStep: 3,
                            isFirstStep: false,
                        })}
                    >
                        <SkillWizardHeader isSaving onClose={jest.fn()} />
                    </SkillWizardContext.Provider>
                </ThemeProvider>,
            )
            expect(screen.getByText('Saving')).toBeInTheDocument()
        })

        it('disables Back and Next while isSaving is true', () => {
            renderHeader({
                context: buildContext({
                    currentStep: 5,
                    isFirstStep: false,
                    isLastStep: false,
                }),
                isSaving: true,
            })

            expect(screen.getByRole('button', { name: /Back$/ })).toBeDisabled()
            expect(screen.getByRole('button', { name: /^Next/ })).toBeDisabled()
        })

        it('wires the back arrow, Test, Back and Next buttons to the right callbacks', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()
            const onTest = jest.fn()
            const goBack = jest.fn()
            const goNext = jest.fn()
            renderHeader({
                context: buildContext({
                    currentStep: 4,
                    isFirstStep: false,
                    onTest,
                    goBack,
                    goNext,
                }),
                onClose,
            })

            await user.click(
                screen.getByRole('button', { name: 'Back to skills' }),
            )
            expect(onClose).toHaveBeenCalledTimes(1)

            await user.click(screen.getByRole('button', { name: 'Test' }))
            expect(onTest).toHaveBeenCalledTimes(1)

            await user.click(screen.getByRole('button', { name: /Back$/ }))
            expect(goBack).toHaveBeenCalledTimes(1)

            await user.click(screen.getByRole('button', { name: /^Next/ }))
            expect(goNext).toHaveBeenCalledTimes(1)
        })
    })

    describe('on the recap step', () => {
        it('shows Final approval and the Progress saved indicator', () => {
            renderHeader({
                context: buildContext({
                    currentStep: 10,
                    isFirstStep: false,
                    isLastStep: true,
                    isRecapStep: true,
                }),
            })

            expect(
                screen.getByRole('heading', { name: 'Final approval' }),
            ).toBeInTheDocument()
            expect(screen.getByText('Progress saved')).toBeInTheDocument()
        })

        it('hides the progress label and the Test/Back/Next CTAs', () => {
            renderHeader({
                context: buildContext({
                    currentStep: 10,
                    isFirstStep: false,
                    isLastStep: true,
                    isRecapStep: true,
                }),
            })

            expect(
                screen.queryByText(/Reviewing draft/i),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Test' }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Back' }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Next' }),
            ).not.toBeInTheDocument()
        })
    })
})
