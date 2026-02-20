import type { ComponentProps } from 'react'

import { userEvent } from '@repo/testing'
import * as platform from '@repo/utils'
import { screen } from '@testing-library/react'
import type { History } from 'history'
import { createBrowserHistory } from 'history'
import { MemoryRouter, Router } from 'react-router-dom'

import { mockSearchRank } from 'fixtures/searchRank'
import { EntityType } from 'hooks/useSearchRankScenario'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import SpotlightRow from 'pages/common/components/Spotlight/SpotlightRow'
import { renderWithRouter } from 'utils/testing'

describe('<SpotlightRow/>', () => {
    const mockOnClose = jest.fn()
    const minProps: ComponentProps<typeof SpotlightRow> = {
        title: 'This is the title',
        info: 'And this is the info!',
        link: '/app/foo',
        onCloseModal: mockOnClose,
        id: 1,
        index: 1,
        entityType: EntityType.Ticket,
    }

    it('should render with minimal props', () => {
        const { container } = renderWithRouter(<SpotlightRow {...minProps} />)

        expect(container).toMatchSnapshot()
    })

    it('should render with icon', () => {
        const { container } = renderWithRouter(
            <SpotlightRow {...minProps} icon={'🚀'} />,
        )

        expect(container).toMatchSnapshot()
    })

    it('should shrink info flex container', () => {
        const { container } = renderWithRouter(
            <SpotlightRow {...minProps} shrinkInfo={true} />,
        )

        expect(container).toMatchSnapshot()
    })

    it('should register search rank scenario event when user clicks on the row', () => {
        renderWithRouter(
            <SearchRankScenarioContext.Provider value={mockSearchRank}>
                <SpotlightRow {...minProps} />
            </SearchRankScenarioContext.Provider>,
        )

        userEvent.click(screen.getByText(minProps.title))

        expect(mockSearchRank.registerResultSelection).toHaveBeenCalledWith({
            id: 1,
            index: 1,
            type: minProps.entityType,
        })
    })

    it('should register search rank scenario when user triggers navigation with keyboard', () => {
        const history: History = createBrowserHistory()
        renderWithRouter(
            <Router history={history}>
                <SearchRankScenarioContext.Provider value={mockSearchRank}>
                    <SpotlightRow {...minProps} selected={true} />
                </SearchRankScenarioContext.Provider>
            </Router>,
        )
        screen.getByText(minProps.title)
        history.push(minProps.link)

        expect(mockSearchRank.registerResultSelection).toHaveBeenCalledWith({
            id: 1,
            index: 1,
            type: minProps.entityType,
        })
    })

    it('should call the onClick prop when user clicks on the row', () => {
        const mockOnClick = jest.fn()

        renderWithRouter(<SpotlightRow {...minProps} onClick={mockOnClick} />)
        userEvent.click(screen.getByText(minProps.title))

        expect(mockOnClick).toHaveBeenCalled()
    })

    it('should close modal on click if user is not pressing on ctrl / cmd', () => {
        renderWithRouter(<SpotlightRow {...minProps} />)

        userEvent.click(screen.getByText(minProps.title))

        expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close modal on click if user is pressing on ctrl on a non-mac device', () => {
        Object.defineProperty(platform, 'isMacOs', {
            value: false,
            writable: true,
        })

        renderWithRouter(<SpotlightRow {...minProps} />)
        userEvent.click(screen.getByText(minProps.title), { ctrlKey: true })

        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should close modal on click if user is pressing on command on a mac device', () => {
        Object.defineProperty(platform, 'isMacOs', {
            value: true,
            writable: true,
        })

        renderWithRouter(<SpotlightRow {...minProps} />)
        userEvent.click(screen.getByText(minProps.title), { metaKey: true })

        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should highlight the row', () => {
        const { container } = renderWithRouter(
            <MemoryRouter>
                <SpotlightRow {...minProps} selected={true} />
            </MemoryRouter>,
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the row with message', () => {
        const messageText = 'some message text'

        renderWithRouter(<SpotlightRow {...minProps} message={messageText} />)

        expect(screen.getByText(messageText)).toBeInTheDocument()
    })

    it('should render the row with message and message should have an em tag', () => {
        const messageText = '<em>text with highlight</em>'
        const messageWithoutEmTag = 'text with highlight'

        renderWithRouter(<SpotlightRow {...minProps} message={messageText} />)

        expect(screen.getByText(messageWithoutEmTag)).toBeInTheDocument()
        expect(
            screen.getByText(messageWithoutEmTag).tagName.toLocaleLowerCase(),
        ).toEqual('em')
    })

    it('should render the row with entityId and it should have an em tag', () => {
        const id = 'someId'
        const entityId = `Some ID: <em>${id}</em>`

        renderWithRouter(<SpotlightRow {...minProps} entityId={entityId} />)

        expect(screen.getByText(id).tagName.toLocaleLowerCase()).toEqual('em')
    })
})
