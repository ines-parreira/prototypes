import type React from 'react'

import { render } from '@testing-library/react'

import { HelpCenterAutomateView } from '../HelpCenterAutomateView'

jest.mock(
    'pages/automate/connectedChannels/legacy/components/ConnectedChannelsHelpCenterView',
    () => ({
        ConnectedChannelsHelpCenterView: ({
            helpCenter,
        }: {
            helpCenter: { id: string }
        }) => (
            <div data-testid="ConnectedChannelsHelpCenterView">
                {helpCenter.id}
            </div>
        ),
    }),
)

jest.mock(
    '../HelpCenterPageWrapper',
    () =>
        ({ children }: { children: React.ReactNode }) => (
            <div data-testid="HelpCenterPageWrapper">{children}</div>
        ),
)

jest.mock('../../hooks/useCurrentHelpCenter', () => {
    return jest.fn(() => ({
        id: 1,
        name: 'helpCenter',
        description: 'description',
    }))
})

describe('HelpCenterAutomateView', () => {
    it('should render', () => {
        render(<HelpCenterAutomateView />)
    })

    it('should render ConnectedChannelsContactFormView', () => {
        const { getByTestId } = render(<HelpCenterAutomateView />)

        expect(
            getByTestId('ConnectedChannelsHelpCenterView'),
        ).toHaveTextContent('1')
    })
})
