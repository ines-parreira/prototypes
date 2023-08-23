import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {personNames} from 'fixtures/personNames'
import Shoutout, {
    SHOUTOUT_MAX_PERSONS,
    SHOUTOUT_NO_PERSONS_PLACEHOLDER,
    SHOUTOUT_NO_VALUE_PLACEHOLDER,
} from './Shoutout'

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

    it('should display N/A values when no valid data is provided', () => {
        render(<Shoutout {...commonProps} persons={[]} value={null} />)

        const noPersonsPlaceholder = screen.getByText(
            SHOUTOUT_NO_PERSONS_PLACEHOLDER
        )
        expect(noPersonsPlaceholder).toBeInTheDocument()
        const noValuePlaceholder = screen.getByText(
            SHOUTOUT_NO_VALUE_PLACEHOLDER
        )
        expect(noValuePlaceholder).toBeInTheDocument()
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

        const tooltipTrigger = screen.getByTestId('shoutout-tooltip-trigger')

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
})
