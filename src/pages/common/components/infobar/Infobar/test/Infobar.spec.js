import React from 'react'
import {Infobar} from '../Infobar'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'


const commonProps = {
    actions: {
        widgets: {
            startEditionMode: jest.fn(() => Promise.resolve()),
            stopEditionMode: jest.fn(() => Promise.resolve()),
            submitWidgets: jest.fn(() => Promise.resolve()),
        },
        infobar: {
            fetchPreviewUser: jest.fn(() => Promise.resolve({resp: {}}))
        }
    },
    context: 'ticket',
    identifier: '1',
    infobar: {},
    isRouteEditingWidgets: false,
    sources: fromJS({
        ticket: {
            requester: {
                id: 2
            }
        },
        user: {
            id: 2
        }
    }),
    user: fromJS({
        id: 2
    }),
    widgets: fromJS({
        _internal: {
            isEditing: false
        }
    }),
    fetchUserHistory: jest.fn(() => Promise.resolve()),
    search: jest.fn(() => Promise.resolve({resp: {data: []}})),
    searchSimilarUser: jest.fn(() => Promise.resolve({user: {id: 4}})),
    setRequester: jest.fn(() => Promise.resolve()),
    location: {
        search: 'searchQuery'
    }
}

describe('Infobar component', () => {
    it('should render ticket context', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render user context', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
                context="user"
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render loading state because the search is in progress', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
            />
        ).setState({isSearching: true})

        expect(component).toMatchSnapshot()
    })

    it('should render loading state because the user is being fetched', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
            />
        ).setState({isFetchingUser: true})

        expect(component).toMatchSnapshot()
    })

    it('should render selected user', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
            />
        ).setState({
            displaySelectedUser: true,
            selectedUser: fromJS({id: 7})
        })

        expect(component).toMatchSnapshot()
    })

    it('should render search results', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
            />
        ).setState({
            displaySearchResults: true,
            searchResults: fromJS([{id: 8}, {id: 9}])
        })

        expect(component).toMatchSnapshot()
    })

    it('should render current user with suggested user', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
            />
        ).setState({
            suggestedUser: fromJS({id: 10})
        })

        expect(component).toMatchSnapshot()
    })

    it('should render widgets edition mode', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
                widgets={fromJS({
                    _internal: {
                        isEditing: true
                    }
                })}
                isRouteEditingWidgets={true}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
