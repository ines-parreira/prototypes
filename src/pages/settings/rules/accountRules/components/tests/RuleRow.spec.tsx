import React, {ComponentProps} from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {emptyManagedRule, emptyRule as ruleFixture} from 'fixtures/rule'
import {
    emptyRuleRecipeFixture,
    emptyRuleRecipeFixture as ruleRecipeFixture,
} from 'fixtures/ruleRecipe'

import {createRule, deleteRule} from 'models/rule/resources'

import {RootState, StoreDispatch} from 'state/types'
import {
    ruleCreated,
    ruleDeleted,
    ruleUpdated,
} from 'state/entities/rules/actions'

import {ManagedRulesSlugs} from 'state/rules/types'
import {RuleRow} from '../RuleRow'

jest.mock('models/rule/resources')
jest.mock('pages/history')
jest.mock('state/entities/rules/actions')

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

    const minProps: ComponentProps<typeof RuleRow> = {
        rule: ruleFixture,
        canDuplicate: true,
        handleUpgrade: jest.fn(),
        onActivate: jest.fn(),
    }

    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const store = mockStore({
        billing: fromJS({plans: []}),
        entities: {
            ruleRecipes: {
                [emptyRuleRecipeFixture.slug]: emptyRuleRecipeFixture,
            },
        },
    } as RootState)

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render a row with a rule', () => {
        const {container} = render(
            <Provider store={store}>
                <RuleRow {...minProps} />)
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render a row with a managed rule tab', () => {
        const {container} = render(
            <Provider store={store}>
                <RuleRow
                    {...minProps}
                    rule={{
                        ...emptyManagedRule,
                        settings: {slug: ManagedRulesSlugs.AutoCloseSpam},
                    }}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should show description on hover', async () => {
        const {getByText, queryByText} = render(
            <Provider store={store}>
                <RuleRow {...minProps} />)
            </Provider>
        )
        fireEvent.mouseEnter(getByText(ruleFixture.name))
        await waitFor(() => {
            const popoverHeader = queryByText(/foo/i)
            expect(popoverHeader).not.toBeNull()
        })
    })
    it('should not show description on hover if rule has no description', async () => {
        const rule = {...ruleFixture, description: ''}

        const {getByText, queryByText} = render(
            <Provider store={store}>
                <RuleRow {...minProps} />)
            </Provider>
        )
        fireEvent.mouseEnter(getByText(rule.name))
        await waitFor(() => {
            const popoverHeader = queryByText(/rule description/i)
            expect(popoverHeader).toBeNull()
        })
    })
    it('should duplicate rule ', async () => {
        createRuleMock.mockResolvedValue(ruleFixture)
        const {getByText} = render(
            <Provider store={store}>
                <RuleRow {...minProps} />)
            </Provider>
        )
        fireEvent.click(getByText(/file_copy/i))
        await waitFor(() => {
            expect(ruleCreatedMock).toHaveBeenCalled()
        })
    })
    it('should prompt confirm and then delete rule on click', async () => {
        deleteRuleMock.mockResolvedValue()
        const {getByText} = render(
            <Provider store={store}>
                <RuleRow {...minProps} />)
            </Provider>
        )
        fireEvent.click(getByText(/delete/i))
        fireEvent.click(getByText(/confirm/i))
        await waitFor(() => {
            expect(ruleDeletedMock).toHaveBeenCalled()
        })
    })
    it('should deactivate on toggle button', async () => {
        const {getByText, getByRole} = render(
            <Provider store={store}>
                <RuleRow {...minProps} />)
            </Provider>
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
        const {getByRole} = render(
            <Provider store={store}>
                <RuleRow {...minProps} rule={deactivatedRule} />)
            </Provider>
        )
        fireEvent.click(getByRole('checkbox'))
        await waitFor(() => {
            expect(minProps.onActivate).toHaveBeenCalled()
        })
    })
    it('should display a badge if the rule comes from the library', () => {
        const rule = {
            ...ruleFixture,
            ...ruleRecipeFixture.rule,
            name: `[${ruleRecipeFixture.recipe_tag}] ${ruleRecipeFixture.rule.name}`,
        }
        const {getByText} = render(
            <Provider store={store}>
                <RuleRow {...minProps} rule={rule} />)
            </Provider>
        )
        expect(getByText(/rule library/gi)).toBeTruthy()
    })
})
