import type React from 'react'

import { systemViewIcons } from '@repo/tickets/utils/views'
import { screen } from '@testing-library/dom'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { getConfigByName } from 'config/views'
import { view as viewsFixture } from 'fixtures/views'
import { newViews } from 'models/view/mocks'
import { EntityType } from 'models/view/types'
import { HeaderContainer } from 'pages/common/components/ViewTable/Header'
import { fetchViewItems } from 'state/views/actions'

jest.mock('lodash/uniqueId', () => () => '42')

jest.mock('state/views/actions.ts', () => {
    const _identity: <T>(arg: T) => T = jest.requireActual('lodash/identity')
    return {
        fetchViewItems: jest.fn(() => _identity),
    }
})
jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))

jest.mock('../ViewTableHeaderToggle', () => ({
    ViewTableHeaderToggle: () => null,
}))

describe('ViewTable::Header', () => {
    const editModeActiveView = fromJS({
        ...viewsFixture,
        editMode: true,
    }) as Map<any, any>

    const type = EntityType.Ticket

    const minProps = {
        type,
        isSearch: false,
        isUpdate: true,
        activeView: fromJS(viewsFixture),
        lastViewId: 0,
        config: getConfigByName(type),
        removeFieldFilter: jest.fn(),
        updateView: jest.fn(),
        setViewEditMode: jest.fn(),
        fetchViewItems: jest.fn(),
        resetView: jest.fn(),
    }

    const renderWithRouter = (children: React.ReactNode) => {
        return render(
            <MemoryRouter initialEntries={['/app/tickets/123']}>
                {children}
            </MemoryRouter>,
        )
    }

    it('should display an empty view', () => {
        const { container } = renderWithRouter(
            <HeaderContainer
                {...minProps}
                activeView={fromJS({})}
                isUpdate={false}
            />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display view on search mode', () => {
        const { getByPlaceholderText } = renderWithRouter(
            <HeaderContainer
                {...minProps}
                isSearch
                activeView={fromJS({
                    ...viewsFixture,
                    search: 'term1',
                })}
            />,
        )

        expect(getByPlaceholderText(/Search tickets/)).toBeInTheDocument()
    })

    it('should display input filled with the search term', () => {
        const searchTerm = 'lost order'

        const { getByDisplayValue } = renderWithRouter(
            <HeaderContainer
                {...minProps}
                isSearch
                activeView={fromJS({
                    ...viewsFixture,
                    search: searchTerm,
                })}
            />,
        )
        expect(getByDisplayValue(searchTerm)).toBeInTheDocument()
    })

    it('should display view on edit mode', () => {
        const { getByDisplayValue } = renderWithRouter(
            <HeaderContainer {...minProps} activeView={editModeActiveView} />,
        )
        expect(getByDisplayValue(viewsFixture.name)).toHaveClass('edit-mode')
    })

    it('should reset view and fetch tickets when clicking on the close flow icon in edit mode', () => {
        renderWithRouter(
            <HeaderContainer {...minProps} activeView={editModeActiveView} />,
        )
        const closeIcon = screen.getByAltText('close-icon')
        fireEvent.click(closeIcon)
        expect(minProps.resetView).toHaveBeenCalled()
        expect(minProps.fetchViewItems).toHaveBeenCalled()
    })

    it('should not update view on search submit when not in search mode', () => {
        renderWithRouter(<HeaderContainer {...minProps} isSearch />)
        const searchInput = screen.getByPlaceholderText(/Search/i)
        fireEvent.change(searchInput, { target: { value: 'foo search' } })

        expect(minProps.updateView).not.toHaveBeenCalled()
    })

    it('display the view name', () => {
        const { getByText } = renderWithRouter(
            <HeaderContainer {...minProps} />,
        )
        expect(getByText(viewsFixture.name)).toBeInTheDocument()
    })

    it('should update search and ordering of the active view and not fetch view items on search input submit', async () => {
        renderWithRouter(<HeaderContainer {...minProps} isSearch />)
        const searchTerm = 'term1'
        const searchInput = screen.getByPlaceholderText(/Search/i)
        fireEvent.change(searchInput, { target: { value: searchTerm } })

        await waitFor(() => {
            expect(screen.getByDisplayValue(searchTerm)).toBeInTheDocument()
            fireEvent.keyDown(searchInput, { key: 'Enter' })
            expect(minProps.updateView).toHaveBeenLastCalledWith(
                (
                    fromJS({
                        ...viewsFixture,
                        order_by: undefined,
                        order_dir: undefined,
                    }) as Map<any, any>
                ).set('search', searchTerm),
                false,
            )
        })

        expect(fetchViewItems).not.toHaveBeenCalled()
    })

    it('update view name', () => {
        renderWithRouter(
            <HeaderContainer {...minProps} activeView={editModeActiveView} />,
        )
        const viewNameInput = screen.getByDisplayValue(
            (minProps.activeView as Map<any, any>).get('name'),
        )
        fireEvent.change(viewNameInput, { target: { value: 'new name' } })
        fireEvent.keyUp(viewNameInput, { key: 'Enter' })
        fireEvent.blur(viewNameInput)

        expect(minProps.updateView).toHaveBeenCalled()
    })

    describe('emoji picker', () => {
        const emoji = '😀'

        describe('.render()', () => {
            it('should render emoji if decoration.emoji is a string', () => {
                const emoji = 'foo'
                const activeView = editModeActiveView.merge({
                    decoration: { emoji },
                })
                const { getByText } = renderWithRouter(
                    <HeaderContainer {...minProps} activeView={activeView} />,
                )
                expect(getByText(emoji)).toBeInTheDocument()
            })

            it('should not render emoji if decoration is not an object', () => {
                const activeView = editModeActiveView.merge({
                    decoration: 'foo',
                })
                const { getByText } = renderWithRouter(
                    <HeaderContainer {...minProps} activeView={activeView} />,
                )
                expect(getByText('insert_emoticon')).toBeInTheDocument()
            })

            it('should not render emoji if decoration.emoji is not a string', () => {
                const activeView = editModeActiveView.merge({
                    decoration: {
                        emoji: {},
                    },
                })
                const { getByText } = renderWithRouter(
                    <HeaderContainer {...minProps} activeView={activeView} />,
                )
                expect(getByText('insert_emoticon')).toBeInTheDocument()
            })
        })

        describe('emoji select', () => {
            it('should update decoration.emoji on emoji select', () => {
                const activeView = editModeActiveView.merge({
                    decoration: null,
                })
                const { baseElement } = renderWithRouter(
                    <HeaderContainer {...minProps} activeView={activeView} />,
                )
                const emojiSelect = screen.getByText('insert_emoticon')
                fireEvent.click(emojiSelect)

                const emojiSelection =
                    baseElement.getElementsByClassName('emoji-mart-emoji')[0]
                fireEvent.click(emojiSelection)

                const updateView = minProps.updateView.mock.calls[0] as Map<
                    any,
                    any
                >[]
                expect(updateView[0].getIn(['decoration', 'emoji'])).toEqual(
                    emojiSelection.textContent,
                )
            })

            it('should not override existing decoration object properties', () => {
                const decoration = { foo: 'bar' }
                const activeView = editModeActiveView.merge({ decoration })
                const { baseElement } = renderWithRouter(
                    <HeaderContainer {...minProps} activeView={activeView} />,
                )
                const emojiSelect = screen.getByText('insert_emoticon')
                fireEvent.click(emojiSelect)

                const emojiSelection =
                    baseElement.getElementsByClassName('emoji-mart-emoji')[0]
                fireEvent.click(emojiSelection)

                const updateView = minProps.updateView.mock.calls[0] as Map<
                    any,
                    any
                >[]
                expect(updateView[0].getIn(['decoration', 'foo'])).toEqual(
                    decoration.foo,
                )
            })
        })

        describe('emoji clear', () => {
            it('should unset decoration.emoji view on emoji clear', () => {
                const activeView = editModeActiveView.merge({
                    decoration: { emoji },
                })
                const { baseElement } = renderWithRouter(
                    <HeaderContainer {...minProps} activeView={activeView} />,
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
                    expectedActiveView,
                )
            })
        })

        describe('tooltip for missing view name', () => {
            it('should display a tooltip when the name of the active view is empty', () => {
                const { rerender } = renderWithRouter(
                    <HeaderContainer
                        {...minProps}
                        activeView={editModeActiveView}
                    />,
                )

                rerender(
                    <MemoryRouter initialEntries={['/app/tickets/123']}>
                        <HeaderContainer
                            {...minProps}
                            activeView={editModeActiveView.merge({
                                name: '',
                            })}
                        />
                    </MemoryRouter>,
                )

                expect(
                    screen.getByText(/Please add a name to your view/i),
                ).toBeInTheDocument()
            })

            it('should not display a tooltip when the name of the view is filled', () => {
                renderWithRouter(<HeaderContainer {...minProps} />)

                expect(
                    screen.queryByText(/Please add a name to your view/i),
                ).not.toBeInTheDocument()
            })
        })
    })

    it('should display material icon next to the view name for a view system', () => {
        const { getByText } = renderWithRouter(
            <HeaderContainer {...minProps} activeView={fromJS(newViews[0])} />,
        )
        expect(
            getByText(
                systemViewIcons[
                    newViews[0].slug as keyof typeof systemViewIcons
                ],
            ),
        ).toBeInTheDocument()
    })
})
