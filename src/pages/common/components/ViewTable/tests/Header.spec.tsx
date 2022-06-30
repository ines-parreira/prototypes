import React, {MouseEvent} from 'react'
import {shallow, ShallowWrapper} from 'enzyme'
import {fromJS, Map} from 'immutable'

import Search from 'pages/common/components/Search'
import * as viewsFixtures from 'fixtures/views'
import * as viewsActions from 'state/views/actions'
import history from 'pages/history'
import EmojiSelect from 'pages/common/components/ViewTable/EmojiSelect/EmojiSelect'
import {getConfigByName} from 'config/views'

import {HeaderContainer} from '../Header'

jest.mock('state/views/actions.ts', () => {
    const _identity: <T>(arg: T) => T = jest.requireActual('lodash/identity')
    return {
        fetchViewItems: jest.fn(() => _identity),
    }
})
jest.mock('react-router-dom')
jest.mock('pages/history')

describe('ViewTable::Header', () => {
    const fixtureView = viewsFixtures.view
    const editModeActiveView = fromJS({
        ...fixtureView,
        editMode: true,
    }) as Map<any, any>

    const minProps = {
        type: 'ticket',
        isSearch: false,
        isUpdate: true,
        activeView: fromJS(fixtureView),
        lastViewId: 0,
        deleteView: jest.fn(),
        removeFieldFilter: jest.fn(),
        updateView: jest.fn(),
        setViewEditMode: jest.fn(),
        fetchViewItems: jest.fn(),
        resetView: jest.fn(),
    }

    const config = getConfigByName(minProps.type)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('empty view', () => {
        const component = shallow(
            <HeaderContainer
                {...minProps}
                config={config}
                activeView={fromJS({})}
                isUpdate={false}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('search view', () => {
        const component = shallow(
            <HeaderContainer
                {...minProps}
                config={config}
                isSearch
                activeView={fromJS({
                    ...fixtureView,
                    search: 'term1',
                })}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render when view is in edit mode', () => {
        const component = shallow(
            <HeaderContainer
                {...minProps}
                config={config}
                activeView={editModeActiveView}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should reset view and fetch tickets when clicking on the close flow icon in edit mode', () => {
        const component = shallow(
            <HeaderContainer
                {...minProps}
                config={config}
                activeView={editModeActiveView}
            />
        )
        component.find({alt: 'close-icon'}).simulate('click')
        expect(minProps.resetView).toHaveBeenCalled()
        expect(minProps.fetchViewItems).toHaveBeenCalled()
    })

    it('should not update view on search submit when not in search mode', () => {
        const component = shallow(
            <HeaderContainer {...minProps} isSearch={false} config={config} />
        )
        const onKeyDown = component.find(Search).props().onKeyDown

        if (onKeyDown) {
            onKeyDown(
                new KeyboardEvent('keydown', {key: 'enter'}) as any,
                'foo search'
            )
        }

        expect(minProps.updateView).not.toHaveBeenCalled()
    })

    describe('default view', () => {
        let component: ShallowWrapper
        beforeEach(() => {
            component = shallow(
                <HeaderContainer {...minProps} config={config} />
            )
        })

        it('displays', () => {
            expect(component).toMatchSnapshot()
        })

        it('should update search of the active view and not fetch view items on search input submit', () => {
            const component = shallow(
                <HeaderContainer {...minProps} config={config} isSearch />
            )
            const searchTerm = 'term1'
            const searchOnKeyDown = component.find(Search).props().onKeyDown

            if (searchOnKeyDown) {
                searchOnKeyDown(
                    new KeyboardEvent('keydown', {key: 'Enter'}) as any,
                    searchTerm
                )
            }
            expect(minProps.updateView).toHaveBeenLastCalledWith(
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
            expect(history.push).toHaveBeenNthCalledWith(
                1,
                '/app/tickets/search?q='
            )
        })

        it('should not go to the search mode focusing the search input when already in search mode', () => {
            const component = shallow(
                <HeaderContainer
                    {...minProps}
                    config={config}
                    isSearch={true}
                />
            )
            ;(component.find(Search).props() as {onFocus: () => void}).onFocus()
            expect(history.push).not.toHaveBeenCalled()
        })

        it('get search query from active view', () => {
            const component = shallow(
                <HeaderContainer
                    {...minProps}
                    config={config}
                    activeView={fromJS({
                        ...fixtureView,
                        search: 'term1',
                    })}
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('update view name', () => {
            ;(
                component.instance() as InstanceType<typeof HeaderContainer>
            )._updateViewName('new name')
            expect(minProps.updateView).toBeCalled()
        })

        it('toggle delete confirmation', () => {
            expect(component.state('askDeleteConfirmation')).toBe(false)
            ;(
                component.instance() as InstanceType<typeof HeaderContainer>
            )._toggleDeleteConfirmation()
            expect(component.state('askDeleteConfirmation')).toBe(true)
        })
    })

    describe('emoji picker', () => {
        const emoji = '1'

        describe('.render()', () => {
            it('should render emoji if decoration.emoji is a string', () => {
                const activeView = editModeActiveView.merge({
                    decoration: {emoji: 'foo'},
                })
                const component = shallow(
                    <HeaderContainer
                        {...minProps}
                        config={config}
                        activeView={activeView}
                    />
                )
                expect(component).toMatchSnapshot()
            })

            it('should not render emoji if decoration is not an object', () => {
                const activeView = editModeActiveView.merge({
                    decoration: 'foo',
                })
                const component = shallow(
                    <HeaderContainer
                        {...minProps}
                        config={config}
                        activeView={activeView}
                    />
                )
                expect(component).toMatchSnapshot()
            })

            it('should not render emoji if decoration.emoji is not a string', () => {
                const activeView = editModeActiveView.merge({
                    decoration: {
                        emoji: {},
                    },
                })
                const component = shallow(
                    <HeaderContainer
                        {...minProps}
                        config={config}
                        activeView={activeView}
                    />
                )
                expect(component).toMatchSnapshot()
            })
        })

        describe('emoji select', () => {
            it('should update decoration.emoji on emoji select', () => {
                const activeView = editModeActiveView.merge({
                    decoration: null,
                })
                const component = shallow(
                    <HeaderContainer
                        {...minProps}
                        config={config}
                        activeView={activeView}
                    />
                )
                ;(
                    component.find(EmojiSelect).props() as {
                        onEmojiSelect: (
                            emoji: string,
                            event: MouseEvent<HTMLElement>
                        ) => void
                    }
                ).onEmojiSelect(emoji, {} as MouseEvent<HTMLElement>)
                const expectedActiveView = activeView.merge({
                    decoration: {emoji},
                })
                expect(minProps.updateView).toHaveBeenLastCalledWith(
                    expectedActiveView
                )
            })

            it('should not override existing decoration object properties', () => {
                const decoration = {foo: 'bar'}
                const activeView = editModeActiveView.merge({decoration})
                const component = shallow(
                    <HeaderContainer
                        {...minProps}
                        config={config}
                        activeView={activeView}
                    />
                )
                ;(
                    component.find(EmojiSelect).props() as {
                        onEmojiSelect: (
                            emoji: string,
                            event: MouseEvent<HTMLElement>
                        ) => void
                    }
                ).onEmojiSelect(emoji, {} as MouseEvent<HTMLElement>)
                const expectedActiveView = activeView.merge({
                    decoration: {
                        ...decoration,
                        emoji,
                    },
                })
                expect(minProps.updateView).toHaveBeenLastCalledWith(
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
                    <HeaderContainer
                        {...minProps}
                        config={config}
                        activeView={activeView}
                    />
                )

                ;(
                    component.find(EmojiSelect).props() as {
                        onEmojiClear: (
                            event: MouseEvent<HTMLButtonElement>
                        ) => void
                    }
                ).onEmojiClear({} as MouseEvent<HTMLButtonElement>)
                const expectedActiveView = activeView.merge({
                    decoration: {},
                })
                expect(minProps.updateView).toHaveBeenLastCalledWith(
                    expectedActiveView
                )
            })

            it('should not change the active view on emoji clear if decoration is null', () => {
                const activeView = editModeActiveView.merge({
                    decoration: null,
                })
                const component = shallow(
                    <HeaderContainer
                        {...minProps}
                        config={config}
                        activeView={activeView}
                    />
                )

                ;(
                    component.find(EmojiSelect).props() as {
                        onEmojiClear: (
                            event: MouseEvent<HTMLButtonElement>
                        ) => void
                    }
                ).onEmojiClear({} as MouseEvent<HTMLButtonElement>)
                expect(minProps.updateView).not.toHaveBeenCalled()
            })
        })
    })
})
