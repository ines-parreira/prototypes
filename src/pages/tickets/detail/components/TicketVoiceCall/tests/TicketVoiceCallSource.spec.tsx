import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Provider} from 'react-redux'
import {mockStore} from 'utils/testing'
import TicketVoiceCallSource from '../TicketVoiceCallSource'

jest.mock(
    'pages/common/utils/DatetimeLabel',
    () =>
        ({dateTime}: {dateTime: string}) =>
            <div>{dateTime}</div>
)

describe('TicketVoiceCallSource', () => {
    const props = {
        to: '123456789',
        from: '987654321',
        icon: 'phone',
        id: 'test-id',
        date: '2022-01-01T00:00:00.000Z',
    }

    const renderComponent = () => {
        return render(
            <Provider store={mockStore({} as any)}>
                <TicketVoiceCallSource {...props} />
            </Provider>
        )
    }

    it('should render the component', () => {
        renderComponent()
        const phoneIcon = screen.getByText(props.icon)
        expect(phoneIcon).toBeInTheDocument()
    })

    it('should render the tooltip with the correct details', async () => {
        renderComponent()
        const phoneIcon = screen.getByText(props.icon)

        userEvent.hover(phoneIcon)

        await screen.findByText('from:')

        const tooltipContent = [
            {
                label: 'from:',
                value: props.from,
            },
            {
                label: 'to:',
                value: props.to,
            },
            {
                label: 'date:',
                value: props.date,
            },
        ]
        tooltipContent.forEach(({label, value}) => {
            expect(screen.getByText(label)).toBeInTheDocument()
            expect(screen.getByText(value)).toBeInTheDocument()
        })
    })
})
