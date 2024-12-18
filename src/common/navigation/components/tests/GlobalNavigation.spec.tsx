import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'

import {UserRole} from 'config/types/user'
import {getCurrentUser} from 'state/currentUser/selectors'
import {assumeMock} from 'utils/testing'

import useActiveItem from '../../hooks/useActiveItem'
import GlobalNavigation from '../GlobalNavigation'

jest.mock('state/currentUser/selectors', () => ({getCurrentUser: jest.fn()}))
const getCurrentUserMock = assumeMock(getCurrentUser)

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('../../hooks/useActiveItem', () => jest.fn())
const useActiveItemMock = assumeMock(useActiveItem)

jest.mock('../GlobalNavigationSpotlight', () => ({
    GlobalNavigationSpotlight: () => <div>GlobalNavigationSpotlight</div>,
}))
jest.mock('../UserItem', () => () => <div>UserItem</div>)

describe('GlobalNavigation', () => {
    beforeEach(() => {
        getCurrentUserMock.mockReturnValue(
            fromJS({role: {name: UserRole.BasicAgent}})
        )
        useActiveItemMock.mockReturnValue('tickets')
    })

    it('should render the home icon', () => {
        const {getByText} = render(<GlobalNavigation />)
        expect(getByText('home')).toBeInTheDocument()
    })

    it('should render the search icon', () => {
        const {getByText} = render(<GlobalNavigation />)
        expect(getByText('GlobalNavigationSpotlight')).toBeInTheDocument()
    })

    it('should render the tickets icon', () => {
        const {getByText} = render(<GlobalNavigation />)
        expect(getByText('question_answer')).toBeInTheDocument()
    })

    it('should not render the automation icon if the user is not a lead agent', () => {
        const {queryByText} = render(<GlobalNavigation />)
        expect(queryByText('bolt')).not.toBeInTheDocument()
    })

    it('should render the automation icon if the user is a lead agent', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({role: {name: UserRole.Agent}})
        )
        const {getByText} = render(<GlobalNavigation />)
        expect(getByText('bolt')).toBeInTheDocument()
    })

    it('should not render the convert icon if the user is not an admin', () => {
        const {queryByText} = render(<GlobalNavigation />)
        expect(queryByText('monetization_on')).not.toBeInTheDocument()
    })

    it('should render the convert icon if the user is an admin', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({role: {name: UserRole.Admin}})
        )
        const {getByText} = render(<GlobalNavigation />)
        expect(getByText('monetization_on')).toBeInTheDocument()
    })

    it('should render the customers icon', () => {
        const {getByText} = render(<GlobalNavigation />)
        expect(getByText('people')).toBeInTheDocument()
    })

    it('should render the stats icon', () => {
        const {getByText} = render(<GlobalNavigation />)
        expect(getByText('bar_chart')).toBeInTheDocument()
    })

    it('should render the settings icon', () => {
        const {getByText} = render(<GlobalNavigation />)
        expect(getByText('settings')).toBeInTheDocument()
    })

    it('should render the user item', () => {
        const {getByText} = render(<GlobalNavigation />)
        expect(getByText('UserItem')).toBeInTheDocument()
    })
})
