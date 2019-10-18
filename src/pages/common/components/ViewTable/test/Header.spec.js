import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {browserHistory} from 'react-router'

import Search from '../../Search'
import configureStore from '../../../../../store/configureStore'
import * as viewsFixtures from '../../../../../fixtures/views'
import * as viewsActions from '../../../../../state/views/actions'
import Header from '../Header'

jest.mock('../../../../../state/views/actions', () => {
    const _identity = require('lodash/identity')

    return {
        deleteView: jest.fn(() => _identity),
        fetchPage: jest.fn(() => _identity),
        removeFieldFilter: jest.fn(() => _identity),
        toggleSelection: jest.fn(() => _identity),
        updateView: jest.fn(() => _identity),
    }
})

jest.mock('react-router', () => {
    const reactRouter = require.requireActual('react-router')

    return {
        ...reactRouter,
        browserHistory: {
            push: jest.fn(),
        },
    }
})

describe('ViewTable::Header', () => {
    const fixtureView = viewsFixtures.view

    const minStore = {
        views: fromJS({
            active: fixtureView,
        })
    }

    const minProps = {
        type: 'ticket',
        isSearch: false,
        isUpdate: true,
        store: configureStore(minStore),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('empty view', () => {
        const component = shallow(
            <Header
                {...minProps}
                store={configureStore({
                    ...minStore,
                    views: fromJS({}),
                })}
                isUpdate={false}
            />
        ).dive().dive()
        expect(component).toMatchSnapshot()
    })

    it('search view', () => {
        const component = shallow(
            <Header
                {...minProps}
                isSearch
                location={{
                    query: {
                        q: 'term1',
                    }
                }}
            />
        ).dive().dive()
        expect(component).toMatchSnapshot()
    })

    describe('default view', () => {
        let component
        beforeEach(() => {
            component = shallow(<Header {...minProps} />).dive().dive()
        })

        it('displays', () => {
            expect(component).toMatchSnapshot()
        })

        it('search term on change in search input', () => {
            const searchOnChange = component.find(Search).props().onChange
            searchOnChange('term1')
            expect(browserHistory.push).toBeCalled()
        })

        it('go back to last or default view when deleting search in search input', () => {
            const lastViewId = 123

            const searchOnChange = component.instance()._search

            expect(component.find(Search).props().onChange).toEqual(searchOnChange)

            searchOnChange('')
            expect(browserHistory.push).toBeCalled()
            // redirect to default view
            expect(browserHistory.push.mock.calls[0][0]).not.toContain(lastViewId.toString())

            // reset mocks
            jest.clearAllMocks()
            component.setProps({lastViewId})
            searchOnChange('')
            expect(browserHistory.push).toBeCalled()
            // redirect to last view
            expect(browserHistory.push.mock.calls[0][0]).toContain(lastViewId.toString())
        })

        it('get search query from url', () => {
            const component = shallow(
                <Header
                    {...minProps}
                    location={{
                        query: {
                            q: 'term1',
                        }
                    }}
                />
            ).dive().dive()
            expect(component.instance()._searchQuery()).toBe('term1')
        })

        it('update view name', () => {
            component.instance()._updateViewName('new name')
            expect(viewsActions.updateView).toBeCalled()
        })

        it('toggle delete confirmation', () => {
            expect(component.state('askDeleteConfirmation')).toBe(false)
            component.instance()._toggleDeleteConfirmation()
            expect(component.state('askDeleteConfirmation')).toBe(true)
        })
    })
})
