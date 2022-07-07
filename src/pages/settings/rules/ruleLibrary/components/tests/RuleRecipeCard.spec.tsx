import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {render, act, fireEvent, waitFor} from '@testing-library/react'
import _noop from 'lodash/noop'
import {fromJS} from 'immutable'

import {createView} from 'models/view/resources'
import {createTag} from 'models/tag/resources'
import {createRule} from 'models/rule/resources'
import {createSection} from 'models/section/resources'

import {
    emptyRuleRecipeFixture,
    emptyRuleRecipeFixtureWithSections,
} from 'fixtures/ruleRecipe'
import {billingState} from 'fixtures/billing'

import RuleRecipeCard from '../RuleRecipeCard'

jest.mock('models/view/resources')
jest.mock('models/tag/resources', () => {
    const resource = jest.requireActual('models/tag/resources')
    return {
        ...resource,
        createTag: jest.fn(),
        fetchTags: jest.fn().mockResolvedValue({data: []}),
    } as Record<string, unknown>
})
jest.mock('models/rule/resources')
jest.mock('models/section/resources', () => {
    const resource = jest.requireActual('models/section/resources')
    return {
        ...resource,
        createSection: jest.fn().mockResolvedValue({id: 1}),
    } as Record<string, unknown>
})
jest.mock('reapop', () => {
    const reapop = jest.requireActual('reapop')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...reapop,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        updateNotification: jest.fn(() => (args: any) => args),
    }
})

describe('<RuleRecipeCard/>', () => {
    const mockStore = configureMockStore([thunk])
    const createRuleMock = createRule as jest.MockedFunction<typeof createRule>
    const createViewMock = createView as jest.MockedFunction<typeof createView>
    const createTagMock = createTag as jest.MockedFunction<typeof createTag>
    const createSectionMock = createSection as jest.MockedFunction<
        typeof createSection
    >

    let defaultStore = mockStore({
        entities: {},
        billing: fromJS(billingState),
    })
    const minProps = {
        recipe: emptyRuleRecipeFixture,
        onInstall: _noop,
        isModalOpenOnLoad: false,
        isReady: true,
    }

    beforeEach(() => {
        defaultStore = mockStore({
            entities: {},
            billing: fromJS(billingState),
        })
        createRuleMock.mockReset()
        createViewMock.mockReset()
        createTagMock.mockReset()
    })

    describe('render', () => {
        it('should render cards for the library', () => {
            const {container} = render(
                <Provider store={defaultStore}>
                    <RuleRecipeCard {...minProps} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render open the modal on load when specified', async () => {
            const {getByRole} = render(
                <Provider store={defaultStore}>
                    <RuleRecipeCard {...minProps} isModalOpenOnLoad={true} />
                </Provider>
            )
            await waitFor(() => {
                const modal = getByRole('dialog')
                expect(modal.className).toBe('modal show')
            })
        })
        it('should open modal on click', async () => {
            const {container, getByText, findByRole} = render(
                <Provider store={defaultStore}>
                    <RuleRecipeCard {...minProps} />
                </Provider>
            )
            act(() => {
                fireEvent.click(getByText('my rule'))
            })
            await waitFor(() => findByRole('dialog'))
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe('install', () => {
        it('should install rule on click', async () => {
            const {getByText, findByRole} = render(
                <Provider store={defaultStore}>
                    <RuleRecipeCard {...minProps} />
                </Provider>
            )
            act(() => {
                fireEvent.click(getByText('my rule'))
            })
            await waitFor(() => findByRole('dialog'))
            act(() => {
                fireEvent.click(getByText('Install rule'))
            })
            await waitFor(() => {
                expect(createRuleMock).toHaveBeenCalled()
                expect(createViewMock).toHaveBeenCalled()
                expect(createTagMock).toHaveBeenCalled()
            })
            expect(createRuleMock.mock.calls).toMatchSnapshot()
            expect(createViewMock.mock.calls).toMatchSnapshot()
            expect(createTagMock.mock.calls).toMatchSnapshot()
        })
        it('should install rule and rules in sections on click', async () => {
            const {getByText, findByRole} = render(
                <Provider store={defaultStore}>
                    <RuleRecipeCard
                        {...minProps}
                        recipe={emptyRuleRecipeFixtureWithSections}
                    />
                </Provider>
            )
            act(() => {
                fireEvent.click(getByText('my rule'))
            })
            await waitFor(() => findByRole('dialog'))
            act(() => {
                fireEvent.click(getByText('Install rule'))
            })
            await waitFor(() => {
                expect(createSectionMock).toHaveBeenCalled()
                expect(createRuleMock).toHaveBeenCalled()
                expect(createViewMock).toHaveBeenCalled()
                expect(createTagMock).toHaveBeenCalled()
            })
            expect(createSectionMock.mock.calls).toMatchSnapshot()
            expect(createRuleMock.mock.calls).toMatchSnapshot()
            expect(createViewMock.mock.calls).toMatchSnapshot()
            expect(createTagMock.mock.calls).toMatchSnapshot()
        })
    })
})
