import React, {ComponentProps, ComponentType} from 'react'
import {shallow, ShallowWrapper} from 'enzyme'
import {fromJS, Map} from 'immutable'
import {Store} from 'redux'
import {browserHistory} from 'react-router'

import Search from '../../Search.js'
import untypedConfigureStore from '../../../../../store/configureStore.js'
import * as viewsFixtures from '../../../../../fixtures/views.js'
import * as viewsActions from '../../../../../state/views/actions'
import Header, {HeaderContainer} from '../Header'
import EmojiSelect from '../EmojiSelect/index.js'
import {View} from '../../../../../state/views/types'
import {RootState} from '../../../../../state/types'

// $TsFixMe: Remove on store/configureStore migration
const configureStore = (untypedConfigureStore as unknown) as (
    store: Partial<RootState>
) => Store<RootState>

jest.mock('../../../../../state/views/actions.ts', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const _identity: <T>(arg: T) => T = require('lodash/identity')

    return {
        deleteView: jest.fn(() => _identity),
        fetchPage: jest.fn(() => _identity),
        removeFieldFilter: jest.fn(() => _identity),
        toggleSelection: jest.fn(() => _identity),
        updateView: jest.fn(() => _identity),
        fetchViewItems: jest.fn(() => _identity),
    }
})

jest.mock('react-router', () => {
    const reactRouter = require.requireActual('react-router') as Record<
        string,
        any
    >

    return {
        ...reactRouter,
        browserHistory: {
            push: jest.fn(),
        },
    }
})

const HeaderMock = (Header as unknown) as ComponentType<
    ComponentProps<typeof Header> & {store?: any}
>

describe('ViewTable::Header', () => {
    const fixtureView = viewsFixtures.view

    const storeWithActiveView = (activeView: View | Map<any, any>) => ({
        views: fromJS({
            active: activeView,
        }),
    })

    const minStore = storeWithActiveView((fixtureView as unknown) as View)

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
            <HeaderMock
                {...minProps}
                store={configureStore({
                    ...minStore,
                    views: fromJS({}),
                })}
                isUpdate={false}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('search view', () => {
        const component = shallow(
            <HeaderMock
                {...minProps}
                isSearch
                store={configureStore(
                    storeWithActiveView(({
                        ...fixtureView,
                        search: 'term1',
                    } as unknown) as View)
                )}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    describe('default view', () => {
        let component: ShallowWrapper
        beforeEach(() => {
            component = shallow(<HeaderMock {...minProps} />).dive()
        })

        it('displays', () => {
            expect(component).toMatchSnapshot()
        })

        it('should update search of the active view and not fetch view items on search input change', () => {
            const searchTerm = 'term1'
            const searchOnChange = (component.find(Search).props() as {
                onChange: (search: string) => void
            }).onChange
            searchOnChange(searchTerm)
            expect(viewsActions.updateView).toHaveBeenLastCalledWith(
                (fromJS(fixtureView) as Map<any, any>).set(
                    'search',
                    searchTerm
                ),
                false
            )
            expect(viewsActions.fetchViewItems).not.toHaveBeenCalled()
        })

        it('go in search mode when focusing the search input', () => {
            ;(component.find(Search).props() as {onFocus: () => void}).onFocus()
            expect(browserHistory.push).toHaveBeenNthCalledWith(
                1,
                '/app/tickets/search?q='
            )
        })

        it('should not go to the search mode focusing the search input when already in search mode', () => {
            const component = shallow(
                <HeaderMock {...minProps} isSearch={true} />
            ).dive()
            ;(component.find(Search).props() as {onFocus: () => void}).onFocus()
            expect(browserHistory.push).not.toHaveBeenCalled()
        })

        it('get search query from active view', () => {
            const component = shallow(
                <HeaderMock
                    {...minProps}
                    store={configureStore(
                        storeWithActiveView(({
                            ...fixtureView,
                            search: 'term1',
                        } as unknown) as View)
                    )}
                />
            ).dive()
            expect(component).toMatchSnapshot()
        })

        it('update view name', () => {
            ;(component.instance() as InstanceType<
                typeof HeaderContainer
            >)._updateViewName('new name')
            expect(viewsActions.updateView).toBeCalled()
        })

        it('toggle delete confirmation', () => {
            expect(component.state('askDeleteConfirmation')).toBe(false)
            ;(component.instance() as InstanceType<
                typeof HeaderContainer
            >)._toggleDeleteConfirmation()
            expect(component.state('askDeleteConfirmation')).toBe(true)
        })
    })

    describe('emoji picker', () => {
        const editModeActiveView = fromJS({
            ...fixtureView,
            editMode: true,
        }) as Map<any, any>

        const emoji = '1'

        describe('.render()', () => {
            it('should render emoji if decoration.emoji is a string', () => {
                const activeView = editModeActiveView.merge({
                    decoration: {emoji: 'foo'},
                })
                const component = shallow(
                    <HeaderMock
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                ).dive()
                expect(component).toMatchSnapshot()
            })

            it('should not render emoji if decoration is not an object', () => {
                const activeView = editModeActiveView.merge({
                    decoration: 'foo',
                })
                const component = shallow(
                    <HeaderMock
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                ).dive()
                expect(component).toMatchSnapshot()
            })

            it('should not render emoji if decoration.emoji is not a string', () => {
                const activeView = editModeActiveView.merge({
                    decoration: {
                        emoji: {},
                    },
                })
                const component = shallow(
                    <HeaderMock
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                ).dive()
                expect(component).toMatchSnapshot()
            })
        })

        describe('emoji select', () => {
            it('should update decoration.emoji on emoji select', () => {
                const activeView = editModeActiveView.merge({
                    decoration: null,
                })
                const component = shallow(
                    <HeaderMock
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                ).dive()
                ;(component.find(EmojiSelect).props() as {
                    onEmojiSelect: (emoji: string) => void
                }).onEmojiSelect(emoji)
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
                    <HeaderMock
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                ).dive()
                ;(component.find(EmojiSelect).props() as {
                    onEmojiSelect: (emoji: string) => void
                }).onEmojiSelect(emoji)
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
                    <HeaderMock
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                ).dive()

                ;(component.find(EmojiSelect).props() as {
                    onEmojiClear: () => void
                }).onEmojiClear()
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
                    <HeaderMock
                        {...minProps}
                        store={configureStore(storeWithActiveView(activeView))}
                    />
                ).dive()

                ;(component.find(EmojiSelect).props() as {
                    onEmojiClear: () => void
                }).onEmojiClear()
                expect(viewsActions.updateView).not.toHaveBeenCalled()
            })
        })
    })
})
