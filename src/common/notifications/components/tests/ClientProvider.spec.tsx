import React, { useContext } from 'react'

import { useKnockFeed } from '@knocklabs/react'
import { render } from '@testing-library/react'

import Client from '../../Client'
import Context from '../../Context'
import ClientProvider from '../ClientProvider'

jest.mock('@knocklabs/react', () => ({
    useKnockFeed: jest.fn(),
}))
const useKnockFeedMock = useKnockFeed as jest.Mock

jest.mock('../../Client')

describe('ClientProvider', () => {
    beforeEach(() => {
        const feedClient = { feed: 'client' }
        useKnockFeedMock.mockReturnValue({ feedClient })
    })

    it('should provide the context', () => {
        const Test = () => {
            const ctx = useContext(Context)

            return <>has context? {!!ctx ? 'yes' : 'no'}</>
        }

        const { getByText } = render(
            <ClientProvider>
                <Test />
            </ClientProvider>,
        )

        expect(getByText('has context? yes'))
    })

    it('should only create a client once', () => {
        const { rerender } = render(<ClientProvider>boop</ClientProvider>)
        expect(Client).toHaveBeenCalledWith({ feed: 'client' })

        rerender(<ClientProvider>boop</ClientProvider>)
        expect(Client).toHaveBeenCalledTimes(1)
    })
})
