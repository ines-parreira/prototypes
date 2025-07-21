import React, { PropsWithChildren } from 'react'

import { render } from '@testing-library/react'

import { channels } from 'common/notifications/data'

import EventSettingsTableHead from '../EventSettingsTableHead'

const TableWrapper = ({ children }: PropsWithChildren<unknown>) => (
    <table>{children}</table>
)

describe('<EventSettingsTableHead/>', () => {
    it('should render type header in table header', () => {
        const { getByText } = render(
            <EventSettingsTableHead typeHeader="Event" />,
            { wrapper: TableWrapper },
        )

        expect(getByText('Event')).toBeInTheDocument()
    })

    it.each(channels.map((channel) => channel.label))(
        `should render channel name in table header - %s`,
        (channel) => {
            const { getByText } = render(
                <EventSettingsTableHead typeHeader="Event" />,
                { wrapper: TableWrapper },
            )

            expect(getByText(channel as string)).toBeInTheDocument()
        },
    )
})
