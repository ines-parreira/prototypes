import React from 'react'
import {shallow, ShallowWrapper} from 'enzyme'
import {fromJS, Map} from 'immutable'

import Search from '../../Search'
import * as viewsFixtures from '../../../../../fixtures/views'
import * as viewsActions from '../../../../../state/views/actions'
import history from '../../../../history'
import {HeaderContainer} from '../Header'
import EmojiSelect from '../EmojiSelect/EmojiSelect'
import {getConfigByName} from '../../../../../config/views'

jest.mock('../../../../../state/views/actions.ts', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const _identity: <T>(arg: T) => T = require('lodash/identity')

    return {
        fetchViewItems: jest.fn(() => _identity),
    }
})

jest.mock('react-router-dom')

jest.mock('../../../../history')

describe('ViewTable::Header', () => {
    const fixtureView = viewsFixtures.view

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

        it('should update search of the active view and not fetch view items on search input change', () => {
            const searchTerm = 'term1'
            const searchOnChange = (component.find(Search).props() as {
                onChange: (search: string) => void
            }).onChange
            searchOnChange(searchTerm)
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
            ;(component.instance() as InstanceType<
                typeof HeaderContainer
            >)._updateViewName('new name')
            expect(minProps.updateView).toBeCalled()
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
                ;(component.find(EmojiSelect).props() as {
                    onEmojiSelect: (emoji: string) => void
                }).onEmojiSelect(emoji)
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
                ;(component.find(EmojiSelect).props() as {
                    onEmojiSelect: (emoji: string) => void
                }).onEmojiSelect(emoji)
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

                ;(component.find(EmojiSelect).props() as {
                    onEmojiClear: () => void
                }).onEmojiClear()
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

                ;(component.find(EmojiSelect).props() as {
                    onEmojiClear: () => void
                }).onEmojiClear()
                expect(minProps.updateView).not.toHaveBeenCalled()
            })
        })
    })
})
