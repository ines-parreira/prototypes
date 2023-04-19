import React, {ComponentProps, ReactNode} from 'react'
import {fromJS} from 'immutable'

import {renderWithRouter} from 'utils/testing'
import {view as fixtureView} from 'fixtures/views'
import ViewTable from 'pages/common/components/ViewTable/ViewTable'

import {TicketListContainer} from '../TicketListContainer'

jest.mock(
    'pages/common/components/ViewTable/ViewTable',
    () =>
        ({
            items,
            isUpdate,
            isSearch,
            urlViewId,
            ActionsComponent,
        }: ComponentProps<typeof ViewTable>) =>
            (
                <div>
                    ViewTable:
                    <div>items: {JSON.stringify(items)}</div>
                    <div>isUpdate: {JSON.stringify(isUpdate)}</div>
                    <div>isSearch: {JSON.stringify(isSearch)}</div>
                    <div>urlViewId: {JSON.stringify(urlViewId)}</div>
                    <div>
                        ActionsComponent:
                        {
                            //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                            ActionsComponent.toString()
                        }
                    </div>
                </div>
            )
)

jest.mock(
    'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioProvider',
    () =>
        ({children}: {children: ReactNode}) =>
            <div data-testid="search-rank-scenario-provider">{children}</div>
)

describe('<TicketListContainer />', () => {
    const minProps = {
        activeView: fromJS(fixtureView),
        fetchTags: jest.fn(),
        hasActiveView: true,
        selectedItemsIds: fromJS([]),
        tickets: fromJS([]),
    } as unknown as ComponentProps<typeof TicketListContainer>

    it('should display with default props', () => {
        const {container} = renderWithRouter(
            <TicketListContainer {...minProps} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch the tags on load', () => {
        renderWithRouter(<TicketListContainer {...minProps} />)
        expect(minProps.fetchTags).toHaveBeenCalled()
    })

    it('should display "New view" as title', () => {
        renderWithRouter(<TicketListContainer {...minProps} />, {
            path: 'app/tickets/',
            route: 'app/tickets/new',
        })
        expect(document.title).toEqual('New view')
    })

    it(`should display "${
        minProps.activeView.get('name') as string
    }" as title`, () => {
        renderWithRouter(<TicketListContainer {...minProps} />)
        expect(document.title).toEqual(minProps.activeView.get('name'))
    })

    it('should display Search as title', () => {
        renderWithRouter(<TicketListContainer {...minProps} />, {
            path: 'app/tickets/',
            route: 'app/tickets/search',
        })
        expect(document.title).toEqual('Search')
    })

    it('should render SearchRankProvider on search url', () => {
        const {container} = renderWithRouter(
            <TicketListContainer {...minProps} />,
            {
                path: 'app/tickets/',
                route: 'app/tickets/search',
            }
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
