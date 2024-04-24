import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {
    InfobarSearchResultsList,
    NO_CUSTOMER_FOUND_PLACEHOLDER,
} from 'pages/common/components/infobar/Infobar/InfobarSearchResultsList'

const commonProps = {
    errorMessage: '',
    searchResults: [],
    defaultCustomerId: 1,
    onCustomerClick: jest.fn(),
}

describe('<InfobarSearchResultsList />', () => {
    it('Should render placeholder when no results', () => {
        render(<InfobarSearchResultsList {...commonProps} />)

        expect(
            screen.getByText(NO_CUSTOMER_FOUND_PLACEHOLDER)
        ).toBeInTheDocument()
    })

    it('Should render error message', () => {
        const errorMessage = 'This is an error'

        render(
            <InfobarSearchResultsList
                {...commonProps}
                errorMessage={errorMessage}
            />
        )

        expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('Should render search results when available', () => {
        const searchResults = [
            {
                id: 1,
                name: 'test',
                email: 'testemail',
                channels: [],
            },
            {
                id: 2,
                name: 'test2',
                email: 'testemail2',
                channels: [],
            },
        ]

        render(
            <InfobarSearchResultsList
                {...commonProps}
                searchResults={searchResults}
            />
        )

        searchResults.forEach((result) => {
            expect(screen.getByText(result.name)).toBeInTheDocument()
            expect(screen.getByText(result.email)).toBeInTheDocument()
        })
    })

    it('Should call an onClick with selected customers id', () => {
        const user = {
            id: 1,
            name: 'test',
            email: 'testemail',
            channels: [],
        }
        const searchResults = [
            user,
            {
                id: 2,
                name: 'test2',
                email: 'testemail2',
                channels: [],
            },
        ]
        const onClickSpy = jest.fn()

        render(
            <InfobarSearchResultsList
                {...commonProps}
                searchResults={searchResults}
                onCustomerClick={onClickSpy}
            />
        )
        act(() => {
            userEvent.click(screen.getByText(user.name))
        })

        expect(onClickSpy).toHaveBeenCalledWith(
            user.id,
            searchResults.findIndex((result) => result.id === user.id)
        )
    })

    it('Should render search results with highlights', () => {
        const highlightedEmailPart = 'testemail'
        const highlightedNamePart = 'test'
        const searchResults = [
            {
                id: 1,
                name: 'test name',
                email: 'testemail@test.com',
                channels: [],
                highlights: {
                    email: [`<em>${highlightedEmailPart}</em>@test.com`],
                    name: [`<em>${highlightedNamePart}</em> name`],
                },
            },
        ]

        render(
            <InfobarSearchResultsList
                {...commonProps}
                searchResults={searchResults}
            />
        )

        expect(screen.getByText(highlightedEmailPart)).toBeInTheDocument()
        expect(
            screen.getByText(highlightedEmailPart).tagName.toLocaleLowerCase()
        ).toBe('em')
        expect(screen.getByText(highlightedNamePart)).toBeInTheDocument()
        expect(
            screen.getByText(highlightedNamePart).tagName.toLocaleLowerCase()
        ).toBe('em')
    })
})
