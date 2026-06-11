import type { ComponentProps } from 'react'

import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { toast } from '@gorgias/axiom'

import { emptyRule as ruleFixture } from 'fixtures/rule'
import { createRule, deleteRule, updateRule } from 'models/rule/resources'

import type { RuleEditorProps } from '../RuleFormEditor'
import { RuleFormEditor } from '../RuleFormEditor'

jest.mock('models/rule/resources', () => ({
    createRule: jest.fn(),
    updateRule: jest.fn(),
    deleteRule: jest.fn(),
}))

jest.mock('../ruleEditors/DefaultRuleEditor', () => ({
    __esModule: true,
    DefaultExportDefaultRuleEditor: ({
        handleSubmit,
        handleDelete,
        rule,
    }: RuleEditorProps) => (
        <div>
            <button
                type="button"
                onClick={() => handleSubmit({ name: rule?.name ?? 'new rule' })}
            >
                Trigger submit
            </button>
            <button
                type="button"
                onClick={() =>
                    handleSubmit({ name: rule?.name ?? 'new rule' }, true)
                }
            >
                Trigger submit with missing fields
            </button>
            <button type="button" onClick={() => handleDelete()}>
                Trigger delete
            </button>
        </div>
    ),
}))

const createRuleMock = createRule as jest.MockedFunction<typeof createRule>
const updateRuleMock = updateRule as jest.MockedFunction<typeof updateRule>
const deleteRuleMock = deleteRule as jest.MockedFunction<typeof deleteRule>

describe('<RuleFormEditor />', () => {
    const minProps: ComponentProps<typeof RuleFormEditor> = {
        rule: ruleFixture,
    }
    const renderComponent = (props: ComponentProps<typeof RuleFormEditor>) =>
        render(<RuleFormEditor {...props} />, {
            storeState: {
                currentUser: fromJS({
                    role: {
                        name: 'agent',
                    },
                }),
                entities: {
                    rules: {},
                },
            },
        })

    beforeEach(() => {
        createRuleMock.mockReset()
        updateRuleMock.mockReset()
        deleteRuleMock.mockReset()
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('should render editor for rule', () => {
        const { baseElement } = renderComponent(minProps)
        expect(baseElement.firstChild).toMatchSnapshot()
    })
    it('should render editor for creating rule', () => {
        const props = {
            ...minProps,
            rule: undefined,
        }
        const { baseElement } = renderComponent(props)
        expect(baseElement.firstChild).toMatchSnapshot()
    })

    it('shows an error toast when required fields are missing on submit', async () => {
        const user = userEvent.setup()
        renderComponent(minProps)

        await user.click(
            screen.getByRole('button', {
                name: 'Trigger submit with missing fields',
            }),
        )

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Complete required fields in order to save',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows a success toast after updating an existing rule', async () => {
        updateRuleMock.mockResolvedValueOnce(ruleFixture)
        const user = userEvent.setup()
        renderComponent(minProps)

        await user.click(screen.getByRole('button', { name: 'Trigger submit' }))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Successfully updated rule',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('shows an error toast when updating the rule fails', async () => {
        updateRuleMock.mockRejectedValueOnce(new Error('boom'))
        const user = userEvent.setup()
        renderComponent(minProps)

        await user.click(screen.getByRole('button', { name: 'Trigger submit' }))

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Failed to update rule' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows a success toast after creating a new rule', async () => {
        createRuleMock.mockResolvedValueOnce(ruleFixture)
        const user = userEvent.setup()
        renderComponent({ ...minProps, rule: undefined })

        await user.click(screen.getByRole('button', { name: 'Trigger submit' }))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Successfully created rule',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('shows an error toast when creating the rule fails', async () => {
        createRuleMock.mockRejectedValueOnce(new Error('boom'))
        const user = userEvent.setup()
        renderComponent({ ...minProps, rule: undefined })

        await user.click(screen.getByRole('button', { name: 'Trigger submit' }))

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Failed to create rule' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows a success toast after deleting a rule', async () => {
        deleteRuleMock.mockResolvedValueOnce(undefined)
        const user = userEvent.setup()
        renderComponent(minProps)

        await user.click(screen.getByRole('button', { name: 'Trigger delete' }))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Successfully deleted rule',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('shows an error toast when deleting the rule fails', async () => {
        deleteRuleMock.mockRejectedValueOnce(new Error('boom'))
        const user = userEvent.setup()
        renderComponent(minProps)

        await user.click(screen.getByRole('button', { name: 'Trigger delete' }))

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Failed to delete rule' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
