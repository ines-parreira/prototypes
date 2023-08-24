import React from 'react'
import {fromJS, Map} from 'immutable'
import {fireEvent, render} from '@testing-library/react'
import {screen} from '@testing-library/dom'

import {getConfigByName} from 'config/views'
import {FeatureFlagKey} from 'config/featureFlags'
import {view as viewsFixture} from 'fixtures/views'
import history from 'pages/history'
import {fetchViewItems} from 'state/views/actions'
import {getLDClient} from 'utils/launchDarkly'

import {HeaderContainer} from '../Header'

jest.mock('lodash/uniqueId', () => () => '42')

jest.mock('state/views/actions.ts', () => {
    const _identity: <T>(arg: T) => T = jest.requireActual('lodash/identity')
    return {
        fetchViewItems: jest.fn(() => _identity),
    }
})
jest.mock('react-router-dom')
jest.mock('pages/history')
jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({})

describe('ViewTable::Header', () => {
    const editModeActiveView = fromJS({
        ...viewsFixture,
        editMode: true,
    }) as Map<any, any>

    const type = 'ticket'

    const minProps = {
        type,
        isSearch: false,
        isUpdate: true,
        activeView: fromJS(viewsFixture),
        lastViewId: 0,
        config: getConfigByName(type),
        deleteView: jest.fn(),
        removeFieldFilter: jest.fn(),
        updateView: jest.fn(),
        setViewEditMode: jest.fn(),
        fetchViewItems: jest.fn(),
        resetView: jest.fn(),
    }

    beforeEach(() => {
        allFlagsMock.mockReturnValue({})
    })

    it('empty view', () => {
        const {container} = render(
            <HeaderContainer
                {...minProps}
                activeView={fromJS({})}
                isUpdate={false}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render unfocused search input when spotlight is enabled', () => {
        allFlagsMock.mockReturnValue({
            [FeatureFlagKey.SpotlightGlobalSearch]: true,
        })

        const {container} = render(
            <HeaderContainer
                {...minProps}
                activeView={fromJS({})}
                isUpdate={false}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('search view', () => {
        const {container} = render(
            <HeaderContainer
                {...minProps}
                isSearch
                activeView={fromJS({
                    ...viewsFixture,
                    search: 'term1',
                })}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render search with search term location when spotlight is enabled', () => {
        allFlagsMock.mockReturnValue({
            [FeatureFlagKey.SpotlightGlobalSearch]: true,
        })

        const {container} = render(
            <HeaderContainer
                {...minProps}
                isSearch
                activeView={fromJS({
                    ...viewsFixture,
                    search: 'term1',
                })}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render when view is in edit mode', () => {
        const {container} = render(
            <HeaderContainer {...minProps} activeView={editModeActiveView} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should reset view and fetch tickets when clicking on the close flow icon in edit mode', () => {
        render(
            <HeaderContainer {...minProps} activeView={editModeActiveView} />
        )
        const closeIcon = screen.getByAltText('close-icon')
        fireEvent.click(closeIcon)
        expect(minProps.resetView).toHaveBeenCalled()
        expect(minProps.fetchViewItems).toHaveBeenCalled()
    })

    it('should not update view on search submit when not in search mode', () => {
        render(<HeaderContainer {...minProps} isSearch />)
        const searchInput = screen.getByPlaceholderText(/Search/i)
        fireEvent.change(searchInput, {target: {value: 'foo search'}})

        expect(minProps.updateView).not.toHaveBeenCalled()
    })

    describe('default view', () => {
        it('displays', () => {
            const {container} = render(<HeaderContainer {...minProps} />)
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should update search of the active view and not fetch view items on search input submit', () => {
            render(<HeaderContainer {...minProps} isSearch />)
            const searchTerm = 'term1'
            const searchInput = screen.getByPlaceholderText(/Search/i)
            fireEvent.change(searchInput, {target: {value: searchTerm}})
            fireEvent.keyDown(searchInput, {key: 'Enter'})

            expect(minProps.updateView).toHaveBeenLastCalledWith(
                (fromJS(viewsFixture) as Map<any, any>).set(
                    'search',
                    searchTerm
                ),
                false
            )
            expect(fetchViewItems).not.toHaveBeenCalled()
        })

        it('go in search mode when focusing the search input', () => {
            render(<HeaderContainer {...minProps} />)
            screen.getByPlaceholderText(/Search/i).focus()
            expect(history.push).toHaveBeenNthCalledWith(
                1,
                '/app/tickets/search?q='
            )
        })

        it('should not go to the search mode focusing the search input when already in search mode', () => {
            render(<HeaderContainer {...minProps} isSearch />)

            const searchInput = screen.getByPlaceholderText(/Search/i)
            fireEvent.click(searchInput)
            expect(history.push).not.toHaveBeenCalled()
        })

        it('get search query from active view', () => {
            const {container} = render(
                <HeaderContainer
                    {...minProps}
                    activeView={fromJS({
                        ...viewsFixture,
                        search: 'term1',
                    })}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('update view name', () => {
            render(
                <HeaderContainer
                    {...minProps}
                    activeView={editModeActiveView}
                />
            )
            const viewNameInput = screen.getByDisplayValue(
                (minProps.activeView as Map<any, any>).get('name')
            )
            fireEvent.change(viewNameInput, {target: {value: 'new name'}})
            fireEvent.keyUp(viewNameInput, {key: 'Enter'})
            fireEvent.blur(viewNameInput)

            expect(minProps.updateView).toHaveBeenCalled()
        })
    })

    describe('emoji picker', () => {
        const emoji = '😀'

        describe('.render()', () => {
            it('should render emoji if decoration.emoji is a string', () => {
                const activeView = editModeActiveView.merge({
                    decoration: {emoji: 'foo'},
                })
                const {container} = render(
                    <HeaderContainer {...minProps} activeView={activeView} />
                )
                expect(container.firstChild).toMatchSnapshot()
            })

            it('should not render emoji if decoration is not an object', () => {
                const activeView = editModeActiveView.merge({
                    decoration: 'foo',
                })
                const {container} = render(
                    <HeaderContainer {...minProps} activeView={activeView} />
                )
                expect(container.firstChild).toMatchSnapshot()
            })

            it('should not render emoji if decoration.emoji is not a string', () => {
                const activeView = editModeActiveView.merge({
                    decoration: {
                        emoji: {},
                    },
                })
                const {container} = render(
                    <HeaderContainer {...minProps} activeView={activeView} />
                )
                expect(container.firstChild).toMatchSnapshot()
            })
        })

        describe('emoji select', () => {
            it('should update decoration.emoji on emoji select', () => {
                const activeView = editModeActiveView.merge({
                    decoration: null,
                })
                const {baseElement} = render(
                    <HeaderContainer {...minProps} activeView={activeView} />
                )
                const emojiSelect = screen.getByText('insert_emoticon')
                fireEvent.click(emojiSelect)

                const emojiSelection =
                    baseElement.getElementsByClassName('emoji-mart-emoji')[0]
                fireEvent.click(emojiSelection)

                expect(minProps.updateView.mock.calls[0]).toMatchSnapshot()
            })

            it('should not override existing decoration object properties', () => {
                const decoration = {foo: 'bar'}
                const activeView = editModeActiveView.merge({decoration})
                const {baseElement} = render(
                    <HeaderContainer {...minProps} activeView={activeView} />
                )
                const emojiSelect = screen.getByText('insert_emoticon')
                fireEvent.click(emojiSelect)

                const emojiSelection =
                    baseElement.getElementsByClassName('emoji-mart-emoji')[0]
                fireEvent.click(emojiSelection)

                expect(minProps.updateView.mock.calls[0]).toMatchSnapshot()
            })
        })

        describe('emoji clear', () => {
            it('should unset decoration.emoji view on emoji clear', () => {
                const activeView = editModeActiveView.merge({
                    decoration: {emoji},
                })
                const {baseElement} = render(
                    <HeaderContainer {...minProps} activeView={activeView} />
                )

                const emojiSelect = screen.getByText(emoji)
                fireEvent.click(emojiSelect)

                const emojiSelection =
                    baseElement.getElementsByClassName('emoji-mart-emoji')[0]
                fireEvent.click(emojiSelection)

                const clearEmojiButton = screen.getByText(/Clear icon/i)
                fireEvent.click(clearEmojiButton)

                const expectedActiveView = activeView.merge({
                    decoration: {},
                })
                expect(minProps.updateView).toHaveBeenLastCalledWith(
                    expectedActiveView
                )
            })
        })

        describe('tooltip for missing view name', () => {
            it('should display a tooltip when the name of the active view is empty', () => {
                const {rerender} = render(
                    <HeaderContainer
                        {...minProps}
                        activeView={editModeActiveView}
                    />
                )

                rerender(
                    <HeaderContainer
                        {...minProps}
                        activeView={editModeActiveView.merge({
                            name: '',
                        })}
                    />
                )

                expect(
                    screen.getByText(/Please add a name to your view/i)
                ).toBeInTheDocument()
            })

            it('should not display a tooltip when the name of the view is filled', () => {
                render(<HeaderContainer {...minProps} />)

                expect(
                    screen.queryByText(/Please add a name to your view/i)
                ).not.toBeInTheDocument()
            })
        })
    })
})
