import React, {ComponentProps} from 'react'
import {render, waitFor, fireEvent} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {fetchTags, createTag} from 'models/tag/resources'
import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'
import {RootState, StoreDispatch} from 'state/types'
import history from 'pages/history'

import {RuleRecipe} from 'models/ruleRecipe/types'
import {view} from 'fixtures/views'
import AutoresponderViewButton from '../AutoresponderViewButton'

const fetchTagsMock = fetchTags as jest.MockedFunction<typeof fetchTags>
const createTagMock = createTag as jest.MockedFunction<typeof createTag>

jest.mock('models/tag/resources', () => {
    const resource = jest.requireActual('models/tag/resources')
    return {
        ...resource,
        createTag: jest.fn(),
        fetchTags: jest.fn().mockResolvedValue({data: {data: []}}),
    } as Record<string, unknown>
})

jest.mock('pages/history')

describe('<AutoresponderViewButton/>', () => {
    const minProps: ComponentProps<typeof AutoresponderViewButton> = {
        recipeSlug: emptyRuleRecipeFixture.slug,
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const store = mockStore({
        entities: {
            ruleRecipes: {
                [emptyRuleRecipeFixture.slug]: {
                    ...emptyRuleRecipeFixture,
                    tags: [],
                } as RuleRecipe,
            },
        },
    } as RootState)

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render correctly', async () => {
        const {container, getByText} = render(
            <Provider store={store}>
                <AutoresponderViewButton {...minProps} />
            </Provider>
        )
        await waitFor(() => getByText(/View Tickets Closed By Rule/))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should create tags when not existing', async () => {
        const store = mockStore({
            entities: {
                ruleRecipes: {
                    [emptyRuleRecipeFixture.slug]: emptyRuleRecipeFixture,
                },
            },
        } as RootState)
        const {getByText} = render(
            <Provider store={store}>
                <AutoresponderViewButton {...minProps} />
            </Provider>
        )
        const link = getByText(/View Tickets Closed By Rule/i)
        await waitFor(() => {
            expect(fetchTagsMock).toHaveBeenCalled()
        })
        await waitFor(() => {
            fireEvent.click(link)
            expect(createTagMock).toHaveBeenCalled()
            expect(history.push).toHaveBeenNthCalledWith(1, {
                pathname: '/app/tickets/new/public',
                state: {
                    filters: 'neq(ticket.status, "closed")',
                    slug: 'new-&-open-tickets',
                    viewName: 'New & Open Tickets',
                },
            })
        })
    })

    it('should lead to right view when existing', async () => {
        const store = mockStore({
            entities: {
                ruleRecipes: {
                    [emptyRuleRecipeFixture.slug]: emptyRuleRecipeFixture,
                },
                views: {
                    [view.id]: view,
                },
            },
        } as RootState)
        const {getByText} = render(
            <Provider store={store}>
                <AutoresponderViewButton {...minProps} />
            </Provider>
        )
        const link = getByText(/View Tickets Closed By Rule/i)
        await waitFor(() => {
            fireEvent.click(link)
            expect(history.push).toHaveBeenNthCalledWith(1, {
                pathname: `/app/tickets/${view.id}`,
                state: {},
            })
        })
    })
})
