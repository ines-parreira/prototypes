import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { WizardFooter } from './WizardFooter'

type Overrides = Partial<React.ComponentProps<typeof WizardFooter>>

const renderFooter = (overrides: Overrides = {}) => {
    const props: React.ComponentProps<typeof WizardFooter> = {
        currentStep: 1,
        onCancel: jest.fn(),
        onBack: jest.fn(),
        onContinue: jest.fn(),
        isContinueDisabled: false,
        onSaveAndEnable: jest.fn(),
        onSaveAndTest: jest.fn(),
        isSaving: false,
        isSaveDisabled: false,
        isTestDisabled: false,
        ...overrides,
    }

    render(<WizardFooter {...props} />)
    return props
}

describe('<WizardFooter />', () => {
    describe('Step 1', () => {
        it('renders Cancel and Continue buttons', () => {
            renderFooter()
            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Continue' }),
            ).toBeInTheDocument()
        })

        it('calls onCancel when Cancel is clicked', async () => {
            const user = userEvent.setup()
            const { onCancel } = renderFooter()
            await user.click(screen.getByRole('button', { name: 'Cancel' }))
            expect(onCancel).toHaveBeenCalledTimes(1)
        })

        it('calls onContinue when Continue is clicked', async () => {
            const user = userEvent.setup()
            const { onContinue } = renderFooter()
            await user.click(screen.getByRole('button', { name: 'Continue' }))
            expect(onContinue).toHaveBeenCalledTimes(1)
        })

        it('marks Continue aria-disabled and shows hint when isContinueDisabled', () => {
            renderFooter({ isContinueDisabled: true })
            const continueButton = screen.getByRole('button', {
                name: 'Continue',
            })
            expect(continueButton).toBeAriaDisabled()
            expect(
                screen.getByText(
                    'Fill in action name and description to continue.',
                ),
            ).toBeInTheDocument()
        })

        it('omits the disabled hint when Continue is enabled', () => {
            renderFooter({ isContinueDisabled: false })
            expect(
                screen.queryByText(
                    'Fill in action name and description to continue.',
                ),
            ).not.toBeInTheDocument()
        })
    })

    describe('Step 2', () => {
        it('renders Back and the Save and enable multi-button', () => {
            renderFooter({ currentStep: 2 })
            expect(
                screen.getByRole('button', { name: 'Back' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Save and enable' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Show save options' }),
            ).toBeInTheDocument()
        })

        it('calls onBack when Back is clicked', async () => {
            const user = userEvent.setup()
            const { onBack } = renderFooter({ currentStep: 2 })
            await user.click(screen.getByRole('button', { name: 'Back' }))
            expect(onBack).toHaveBeenCalledTimes(1)
        })

        it('calls onSaveAndEnable when the primary Save and enable button is clicked', async () => {
            const user = userEvent.setup()
            const { onSaveAndEnable } = renderFooter({ currentStep: 2 })
            await user.click(
                screen.getByRole('button', { name: 'Save and enable' }),
            )
            expect(onSaveAndEnable).toHaveBeenCalledTimes(1)
        })

        it('calls onSaveAndTest when the Save and test menuitem is selected', async () => {
            const user = userEvent.setup()
            const { onSaveAndTest } = renderFooter({ currentStep: 2 })

            await user.click(
                screen.getByRole('button', { name: 'Show save options' }),
            )
            await user.click(
                await screen.findByRole('menuitem', { name: 'Save and test' }),
            )

            expect(onSaveAndTest).toHaveBeenCalledTimes(1)
        })

        it('calls onSaveAndEnable when the Save and enable menuitem is selected', async () => {
            const user = userEvent.setup()
            const { onSaveAndEnable } = renderFooter({ currentStep: 2 })

            await user.click(
                screen.getByRole('button', { name: 'Show save options' }),
            )
            await user.click(
                await screen.findByRole('menuitem', {
                    name: 'Save and enable',
                }),
            )

            expect(onSaveAndEnable).toHaveBeenCalledTimes(1)
        })

        it('disables the primary Save and enable button when isSaveDisabled is true', () => {
            renderFooter({ currentStep: 2, isSaveDisabled: true })
            expect(
                screen.getByRole('button', { name: 'Save and enable' }),
            ).toBeAriaDisabled()
        })

        it('marks the footer as busy when isSaving is true', () => {
            const { container } = render(
                <WizardFooter
                    currentStep={2}
                    onCancel={jest.fn()}
                    onBack={jest.fn()}
                    onContinue={jest.fn()}
                    isContinueDisabled={false}
                    onSaveAndEnable={jest.fn()}
                    onSaveAndTest={jest.fn()}
                    isSaving
                    isSaveDisabled={false}
                    isTestDisabled={false}
                />,
            )

            expect(
                container.querySelector('[aria-busy="true"]'),
            ).toBeInTheDocument()
        })

        it('shows a tooltip on the disabled Save and test option when isTestDisabled is true', async () => {
            const user = userEvent.setup()
            renderFooter({ currentStep: 2, isTestDisabled: true })

            await user.click(
                screen.getByRole('button', { name: 'Show save options' }),
            )

            const saveAndTest = await screen.findByRole('menuitem', {
                name: 'Save and test',
            })
            expect(saveAndTest).toBeDisabled()
        })
    })
})
