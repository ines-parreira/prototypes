import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {browserHistory} from 'react-router'

import Search from '../../Search'
import configureStore from '../../../../../store/configureStore'
import * as viewsFixtures from '../../../../../fixtures/views'
import * as viewsActions from '../../../../../state/views/actions.ts'
import Header from '../Header'
import EmojiSelect from '../EmojiSelect'

jest.mock('../../../../../state/views/actions.ts', () => {
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

    const storeWithActiveView = (activeView) => ({
        views: fromJS({
            active: activeView,
        }),
    })

    const minStore = storeWithActiveView(fixtureView)

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
        )
            .dive()
            .dive()
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
                    },
                }}
            />
        )
            .dive()
            .dive()
        expect(component).toMatchSnapshot()
    })

    describe('default view', () => {
        let component
        beforeEach(() => {
            component = shallow(<Header {...minProps} />)
                .dive()
                .dive()
        })

        it('displays', () => {
            expect(component).toMatchSnapshot()
        })

        it('search term on change in search input', () => {
            const searchOnChange = component.find(Search).props().onChange
            searchOnChange('term1')
            expect(browserHistory.push).toBeCalled()
        })

        it('go in search mode when focusing the search input', () => {
            component.find(Search).props().onFocus()
            expect(browserHistory.push).toHaveBeenNthCalledWith(
                1,
                '/app/tickets/search?q='
            )
        })

        it('get search query from url', () => {
            const component = shallow(
                <Header
                    {...minProps}
                    location={{
                        query: {
                            q: 'term1',
                        },
                    }}
                />
            )
                .dive()
                .dive()
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

    describe('emoji picker', () => {
        const editModeActiveView = fromJS({
            ...fixtureView,
            editMode: true,
        })

        const emoji = '1'

        describe('.render()', () => {
            it('should render emoji if decoration.emoji is a string', () => {
                const activeView = editModeActiveView.merge({
                    decoration: {emoji: 'foo'},
                })
                const component = shallow(
                    <Header
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                )
                    .dive()
                    .dive()
                expect(component).toMatchSnapshot()
            })

            it('should not render emoji if decoration is not an object', () => {
                const activeView = editModeActiveView.merge({
                    decoration: 'foo',
                })
                const component = shallow(
                    <Header
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                )
                    .dive()
                    .dive()
                expect(component).toMatchSnapshot()
            })

            it('should not render emoji if decoration.emoji is not a string', () => {
                const activeView = editModeActiveView.merge({
                    decoration: {
                        emoji: {},
                    },
                })
                const component = shallow(
                    <Header
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                )
                    .dive()
                    .dive()
                expect(component).toMatchSnapshot()
            })
        })

        describe('emoji select', () => {
            it('should update decoration.emoji on emoji select', () => {
                const activeView = editModeActiveView.merge({
                    decoration: null,
                })
                const component = shallow(
                    <Header
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                )
                    .dive()
                    .dive()
                component.find(EmojiSelect).props().onEmojiSelect(emoji)
                const expectedActiveView = activeView.merge({
                    decoration: {emoji},
                })
                expect(viewsActions.updateView).toHaveBeenLastCalledWith(
                    expectedActiveView
                )
            })

            it('should not override existing decoration object properties', () => {
                const decoration = {foo: 'bar'}
                const activeView = editModeActiveView.merge({decoration})
                const component = shallow(
                    <Header
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                )
                    .dive()
                    .dive()
                component.find(EmojiSelect).props().onEmojiSelect(emoji)
                const expectedActiveView = activeView.merge({
                    decoration: {
                        ...decoration,
                        emoji,
                    },
                })
                expect(viewsActions.updateView).toHaveBeenLastCalledWith(
                    expectedActiveView
                )
            })
        })

        describe('emoji clear', () => {
            it('should unset decoration.emoji view on emoji clear', () => {
                const activeView = editModeActiveView.merge({
                    decoration: {emoji},
                })
                const component = shallow(
                    <Header
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                )
                    .dive()
                    .dive()

                component.find(EmojiSelect).props().onEmojiClear()
                const expectedActiveView = activeView.merge({
                    decoration: {},
                })
                expect(viewsActions.updateView).toHaveBeenLastCalledWith(
                    expectedActiveView
                )
            })

            it('should not change the active view on emoji clear if decoration is null', () => {
                const activeView = editModeActiveView.merge({
                    decoration: null,
                })
                const component = shallow(
                    <Header
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                )
                    .dive()
                    .dive()

                component.find(EmojiSelect).props().onEmojiClear()
                expect(viewsActions.updateView).not.toHaveBeenCalled()
            })
        })
    })
})
