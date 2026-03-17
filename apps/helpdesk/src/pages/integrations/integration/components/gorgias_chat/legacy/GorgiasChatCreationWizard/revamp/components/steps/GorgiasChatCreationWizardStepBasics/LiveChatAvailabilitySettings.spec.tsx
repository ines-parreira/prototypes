import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
} from 'config/integrations/gorgias_chat'

import { LiveChatAvailabilitySettings } from './LiveChatAvailabilitySettings'

describe('LiveChatAvailabilitySettings', () => {
    const renderComponent = (
        value:
            | typeof GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY
            | typeof GORGIAS_CHAT_LIVE_CHAT_OFFLINE = GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
        onChange = jest.fn(),
    ) =>
        render(
            <LiveChatAvailabilitySettings value={value} onChange={onChange} />,
        )

    it('renders the section heading', () => {
        renderComponent()

        expect(
            screen.getByText('Choose how to connect with customers'),
        ).toBeInTheDocument()
    })

    it('renders both radio options with their labels', () => {
        renderComponent()

        expect(
            screen.getByLabelText('Allow live chat messages'),
        ).toBeInTheDocument()
        expect(
            screen.getByLabelText('Allow only offline capture messages'),
        ).toBeInTheDocument()
    })

    it('checks the live chat radio when value is auto-based', () => {
        renderComponent(GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY)

        expect(screen.getByLabelText('Allow live chat messages')).toBeChecked()
        expect(
            screen.getByLabelText('Allow only offline capture messages'),
        ).not.toBeChecked()
    })

    it('checks the offline radio when value is offline', () => {
        renderComponent(GORGIAS_CHAT_LIVE_CHAT_OFFLINE)

        expect(
            screen.getByLabelText('Allow only offline capture messages'),
        ).toBeChecked()
        expect(
            screen.getByLabelText('Allow live chat messages'),
        ).not.toBeChecked()
    })

    it('calls onChange with the offline value when the offline radio is selected', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderComponent(
            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
            onChange,
        )

        await user.click(
            screen.getByLabelText('Allow only offline capture messages'),
        )

        expect(onChange).toHaveBeenCalledWith(GORGIAS_CHAT_LIVE_CHAT_OFFLINE)
    })

    it('calls onChange with the auto-based value when the live chat radio is selected', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderComponent(GORGIAS_CHAT_LIVE_CHAT_OFFLINE, onChange)

        await user.click(screen.getByLabelText('Allow live chat messages'))

        expect(onChange).toHaveBeenCalledWith(
            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
        )
    })
})
