import type React from 'react'

import { render, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import { ConnectedChannelsView } from '../ConnectedChannelsView'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useRouteMatch: jest.fn(() => ({
        path: '/app/automation/shopify/test-shop/connected-channels',
    })),
}))

jest.mock('../hooks/useConnectedChannelsPreviewPanel', () => ({
    useConnectedChannelsPreviewPanel: jest.fn(),
}))

jest.mock(
    '../components/ConnectedChannelsChatView/ConnectedChannelsChatView',
    () => ({
        ConnectedChannelsChatView: () => <div>ChatView</div>,
    }),
)

jest.mock('../../legacy/components/ConnectedChannelsHelpCenterView', () => ({
    ConnectedChannelsHelpCenterView: () => <div>HelpCenterView</div>,
}))

jest.mock('../../legacy/components/ConnectedChannelsContactFormView', () => ({
    ConnectedChannelsContactFormView: () => <div>ContactFormView</div>,
}))

jest.mock('../../legacy/components/ConnectedChannelsEmailView', () => ({
    ConnectedChannelsEmailView: () => <div>EmailView</div>,
}))

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    const history = createMemoryHistory({ initialEntries: [route] })
    return {
        ...render(<Router history={history}>{ui}</Router>),
        history,
    }
}

describe('ConnectedChannelsView', () => {
    it('should render the chat view on the base route', () => {
        renderWithRouter(<ConnectedChannelsView />, {
            route: '/app/automation/shopify/test-shop/connected-channels',
        })

        expect(screen.getByText('ChatView')).toBeInTheDocument()
    })

    it('should render the help center view on the /help-center route', () => {
        renderWithRouter(<ConnectedChannelsView />, {
            route: '/app/automation/shopify/test-shop/connected-channels/help-center',
        })

        expect(screen.getByText('HelpCenterView')).toBeInTheDocument()
    })

    it('should render the contact form view on the /contact-form route', () => {
        renderWithRouter(<ConnectedChannelsView />, {
            route: '/app/automation/shopify/test-shop/connected-channels/contact-form',
        })

        expect(screen.getByText('ContactFormView')).toBeInTheDocument()
    })

    it('should render the email view on the /email route', () => {
        renderWithRouter(<ConnectedChannelsView />, {
            route: '/app/automation/shopify/test-shop/connected-channels/email',
        })

        expect(screen.getByText('EmailView')).toBeInTheDocument()
    })
})
