import React from 'react'
import {screen, render} from '@testing-library/react'
import {Router} from 'react-router-dom'
import history from 'pages/history'
import {ConnectedChannelsView} from '../ConnectedChannelsView'

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({
        shopType: 'shopType',
        shopName: 'shopName',
    })),
    useRouteMatch: jest.fn(() => ({
        path: '/app/automation/shopType/shopName/connected-channels',
    })),
}))

const renderDefault = () =>
    render(
        <Router history={history}>
            <ConnectedChannelsView />
        </Router>
    )
describe('ConnectedChannelsView', () => {
    it('should render', () => {
        renderDefault()
        expect(screen.getByText('Chat')).toBeInTheDocument()
        expect(screen.getByText('Help Center')).toBeInTheDocument()
        expect(screen.getByText('Contact Form')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
    })
})
