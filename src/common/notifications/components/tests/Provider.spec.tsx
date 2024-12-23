import {render} from '@testing-library/react'
import type {ReactNode} from 'react'
import React from 'react'

import {getCurrentAccountId} from 'state/currentAccount/selectors'
import {getCurrentUserId} from 'state/currentUser/selectors'

import useAuthentication from '../../hooks/useAuthentication'
import Provider, {KNOCK_FEED_ID} from '../Provider'

jest.mock('@knocklabs/react', () => ({
    KnockFeedProvider: ({
        children,
        feedId,
    }: {
        children: ReactNode
        feedId: string
    }) => (
        <div>
            <p>KnockFeedProvider</p>
            <p>feedId: {feedId}</p>
            {children}
        </div>
    ),
    KnockProvider: ({
        apiKey,
        children,
        userId,
        userToken,
    }: {
        apiKey: string
        children: ReactNode
        userId: string
        userToken: string
    }) => (
        <div>
            <p>KnockProvider</p>
            <p>apiKey: {apiKey}</p>
            <p>userId: {userId}</p>
            <p>userToken: {userToken}</p>
            {children}
        </div>
    ),
}))

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('state/currentAccount/selectors', () => ({
    getCurrentAccountId: jest.fn(),
}))
const getCurrentAccountIdMock = getCurrentAccountId as unknown as jest.Mock
jest.mock('state/currentUser/selectors', () => ({
    getCurrentUserId: jest.fn(),
}))
const getCurrentUserIdMock = getCurrentUserId as unknown as jest.Mock

jest.mock('../../hooks/useAuthentication', () => jest.fn())
const useAuthenticationMock = useAuthentication as jest.Mock

jest.mock('../ClientProvider', () => ({children}: {children: ReactNode}) => (
    <div>
        <p>ClientProvider</p>
        {children}
    </div>
))

jest.mock('../Overlay', () => () => <div>Overlay</div>)

describe('Provider', () => {
    beforeEach(() => {
        getCurrentAccountIdMock.mockReturnValue(2)
        getCurrentUserIdMock.mockReturnValue(123)
        useAuthenticationMock.mockReturnValue({
            apiKey: 'api-key',
            refreshToken: () => 'refreshed-token',
            userToken: 'user-token',
        })
    })

    it('should render the KnockProvider', () => {
        const {getByText} = render(<Provider>Boop</Provider>)
        expect(getByText('KnockProvider')).toBeInTheDocument()
        expect(getByText('apiKey: api-key')).toBeInTheDocument()
        expect(getByText('userId: 2.123')).toBeInTheDocument()
        expect(getByText('userToken: user-token')).toBeInTheDocument()
    })

    it('should render the KnockFeedProvider', () => {
        const {getByText} = render(<Provider>Boop</Provider>)
        expect(getByText('KnockFeedProvider')).toBeInTheDocument()
        expect(getByText(`feedId: ${KNOCK_FEED_ID}`)).toBeInTheDocument()
    })

    it('should render the ClientProvider', () => {
        const {getByText} = render(<Provider>Boop</Provider>)
        expect(getByText('ClientProvider')).toBeInTheDocument()
    })

    it('should render the Overlay', () => {
        const {getByText} = render(<Provider>Boop</Provider>)
        expect(getByText('Overlay')).toBeInTheDocument()
    })
})
