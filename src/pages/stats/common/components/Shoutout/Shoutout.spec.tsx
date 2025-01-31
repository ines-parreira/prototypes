import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {personNames} from 'fixtures/personNames'
import Shoutout, {
    SHOUTOUT_MAX_PERSONS,
    SHOUTOUT_NO_VALUE_PLACEHOLDER,
} from 'pages/stats/common/components/Shoutout/Shoutout'
import {ChartsActionMenu} from 'pages/stats/custom-reports/ChartsActionMenu/ChartsActionMenu'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/custom-reports/ChartsActionMenu/ChartsActionMenu')
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)

describe('<Shoutout />', () => {
    const commonProps = {
        metricName: 'First response time',
        value: '3m',
        multiplePersonsLabel: (count: number) => `${count} agents`,
    }

    const person = {name: personNames[0]}
    const fewPersonsList = personNames
        .slice(0, SHOUTOUT_MAX_PERSONS)
        .map((name) => ({name}))
    const manyPersonsList = personNames.map((name) => ({name}))

    it('should display the person name if only one person was provided', () => {
        render(<Shoutout {...commonProps} persons={[person]} />)

        const personName = screen.getByText(person.name)
        expect(personName).toBeInTheDocument()
    })

    it('should display no value placeholders when no valid data is provided', () => {
        render(<Shoutout {...commonProps} persons={[]} value={null} />)

        const noValuePlaceholder = screen.getAllByText(
            SHOUTOUT_NO_VALUE_PLACEHOLDER
        )
        expect(noValuePlaceholder).toHaveLength(3)
    })

    it('should display "{count} agents" if more persons were provided', () => {
        render(<Shoutout {...commonProps} persons={fewPersonsList} />)

        fewPersonsList.forEach((person) => {
            const personName = screen.queryByText(person.name)
            expect(personName).not.toBeInTheDocument()
        })

        const agentsCountLabel = screen.getByText(
            new RegExp(`${fewPersonsList.length} agents`)
        )
        expect(agentsCountLabel).toBeInTheDocument()
    })

    test('the tooltip should show "x more" when the number of provided persons is too big', async () => {
        render(<Shoutout {...commonProps} persons={manyPersonsList} />)

        const tooltipTrigger = screen.getByLabelText(
            'Hover to display more people'
        )

        userEvent.hover(tooltipTrigger)

        const xMoreText = await waitFor(() =>
            screen.getByText(
                new RegExp(
                    `${manyPersonsList.length - SHOUTOUT_MAX_PERSONS} more`
                )
            )
        )

        expect(xMoreText).toBeInTheDocument()
    })

    it('should not render the action menu chartId is undefined', () => {
        ChartsActionMenuMock.mockReturnValue(<div>ChartsActionMenu</div>)

        render(<Shoutout {...commonProps} persons={manyPersonsList} />)

        expect(screen.queryByText('ChartsActionMenu')).not.toBeInTheDocument()
    })

    it('should render the action menu chartId is defined', () => {
        ChartsActionMenuMock.mockReturnValue(<div>ChartsActionMenu</div>)

        render(
            <Shoutout
                {...commonProps}
                persons={manyPersonsList}
                chartId="123"
            />
        )

        expect(screen.getByText('ChartsActionMenu')).toBeInTheDocument()
    })
})
