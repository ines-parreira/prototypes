import type { ComponentProps } from 'react'

import { render as testingRender } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import { toast } from '@gorgias/axiom'

import { emptyManagedRule, emptyRule as ruleFixture } from 'fixtures/rule'
import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { createRule, deactivateRule, deleteRule } from 'models/rule/resources'
import {
    ruleCreated,
    ruleDeleted,
    ruleUpdated,
} from 'state/entities/rules/actions'
import { ManagedRulesSlugs } from 'state/rules/types'

import { RuleRow } from '../RuleRow'

jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('models/rule/resources')
jest.mock('state/entities/rules/actions')
const LocationPath = () => {
    const location = useLocation()

    return <output aria-label="Current path">{location.pathname}</output>
}
const defaultStore = {
    currentUser: fromJS(user),
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {},
            },
        },
        ruleRecipes: {},
    },
}
const render = (
    ui: Parameters<typeof testingRender>[0],
    options?: Parameters<typeof testingRender>[1],
) =>
    testingRender(ui, {
        ...options,
        storeState: options?.storeState ?? defaultStore,
    })
describe('<RuleRow />', () => {
    const ruleCreatedMock = ruleCreated as jest.MockedFunction<
        typeof ruleCreated
    >
    const ruleDeletedMock = ruleDeleted as jest.MockedFunction<
        typeof ruleDeleted
    >
    const ruleUpdatedMock = ruleUpdated as jest.MockedFunction<
        typeof ruleUpdated
    >
    const createRuleMock = createRule as jest.MockedFunction<typeof createRule>
    const deleteRuleMock = deleteRule as jest.MockedFunction<typeof deleteRule>
    const deactivateRuleMock = deactivateRule as jest.MockedFunction<
        typeof deactivateRule
    >
    const mockUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
        typeof useAiAgentAccess
    >
    const minProps: ComponentProps<typeof RuleRow> = {
        rule: ruleFixture,
        canDuplicate: true,
        handleUpgrade: jest.fn(),
        onActivate: jest.fn(),
        shouldDisplayError: false,
        isSearching: false,
    }
    beforeEach(() => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        ruleCreatedMock.mockReturnValue({ type: 'ruleCreated' } as never)
        ruleDeletedMock.mockReturnValue({ type: 'ruleDeleted' } as never)
        ruleUpdatedMock.mockReturnValue({ type: 'ruleUpdated' } as never)
    })
    afterEach(() => {
        jest.clearAllMocks()
        toast.dismiss()
    })
    it('should render a row with a rule', () => {
        const { container } = render(<RuleRow {...minProps} />, {})
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render a row with a managed rule tab', () => {
        const { container } = render(
            <RuleRow
                {...minProps}
                rule={{
                    ...emptyManagedRule,
                    settings: { slug: ManagedRulesSlugs.AutoCloseSpam },
                }}
            />,
            {},
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render a row with an error', () => {
        const { container } = render(
            <RuleRow
                {...minProps}
                rule={{
                    ...emptyManagedRule,
                    settings: {
                        slug: ManagedRulesSlugs.AutoReplyFAQ,
                        help_center_id: 1,
                    },
                }}
                shouldDisplayError={true}
            />,
            {},
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should show description on hover', async () => {
        const { getByText, queryByText } = render(
            <>
                <RuleRow {...minProps} />)
            </>,
            {},
        )
        fireEvent.mouseEnter(getByText(ruleFixture.name))
        await waitFor(() => {
            const popoverHeader = queryByText(/foo/i)
            expect(popoverHeader).not.toBeNull()
        })
    })
    it('should not show description on hover if rule has no description', async () => {
        const rule = { ...ruleFixture, description: '' }
        const { getByText, queryByText } = render(
            <>
                <RuleRow {...minProps} />)
            </>,
            {},
        )
        fireEvent.mouseEnter(getByText(rule.name))
        await waitFor(() => {
            const popoverHeader = queryByText(/rule description/i)
            expect(popoverHeader).toBeNull()
        })
    })
    it('should duplicate rule ', async () => {
        createRuleMock.mockResolvedValue(ruleFixture)
        const { getByText } = render(
            <>
                <RuleRow {...minProps} />
                <LocationPath />)
            </>,
            {},
        )
        fireEvent.click(getByText(/file_copy/i))
        await waitFor(() => {
            expect(ruleCreatedMock).toHaveBeenCalled()
        })
        await waitFor(() => {
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                '/app/settings/rules/1',
            )
        })
    })
    it('should prompt confirm and then delete rule on click', async () => {
        deleteRuleMock.mockResolvedValue()
        const { getByText } = render(
            <>
                <RuleRow {...minProps} />)
            </>,
            {},
        )
        fireEvent.click(getByText(/delete/i))
        fireEvent.click(getByText(/confirm/i))
        await waitFor(() => {
            expect(ruleDeletedMock).toHaveBeenCalled()
        })
    })
    it('should deactivate on toggle button', async () => {
        const { getByText, getByRole } = render(
            <>
                <RuleRow {...minProps} />)
            </>,
            {},
        )
        fireEvent.click(getByRole('checkbox'))
        fireEvent.click(getByText(/confirm/i))
        await waitFor(() => {
            expect(ruleUpdatedMock).toHaveBeenCalled()
        })
    })
    it('should activate on toggle button', async () => {
        const deactivatedRule = {
            ...ruleFixture,
            deactivated_datetime: '2020-01-01T00:00:00',
        }
        const { getByRole } = render(
            <>
                <RuleRow {...minProps} rule={deactivatedRule} />)
            </>,
            {},
        )
        fireEvent.click(getByRole('checkbox'))
        await waitFor(() => {
            expect(minProps.onActivate).toHaveBeenCalled()
        })
    })
    it('should show a success toast when duplicating succeeds', async () => {
        createRuleMock.mockResolvedValue(ruleFixture)
        const { getByText } = render(<RuleRow {...minProps} />, {})
        fireEvent.click(getByText(/file_copy/i))
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Rule duplicated successfully',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })
    it('should show an error toast when duplicating fails', async () => {
        createRuleMock.mockRejectedValue(new Error('boom'))
        const { getByText } = render(<RuleRow {...minProps} />, {})
        fireEvent.click(getByText(/file_copy/i))
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to duplicate rule',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
    it('should show the rule-limit error toast when canDuplicate is false', async () => {
        const { getByText } = render(
            <RuleRow {...minProps} canDuplicate={false} />,
            {},
        )
        fireEvent.click(getByText(/file_copy/i))
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'You have reached the 70 rule limit. Delete existing rules to add more.',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
    it('should show an error toast when deleting fails', async () => {
        deleteRuleMock.mockRejectedValue(new Error('boom'))
        const { getByText } = render(<RuleRow {...minProps} />, {})
        fireEvent.click(getByText(/delete/i))
        fireEvent.click(getByText(/confirm/i))
        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Failed to delete rule' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
    it('should show an error toast when deactivation fails', async () => {
        deactivateRuleMock.mockRejectedValue(new Error('boom'))
        const { getByText, getByRole } = render(<RuleRow {...minProps} />, {})
        fireEvent.click(getByRole('checkbox'))
        fireEvent.click(getByText(/confirm/i))
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Unable to deactivate rule',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
