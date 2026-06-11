import { render, userEvent } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { DefaultExportDistributeToTeamsWidget as DistributeToTeamsWidget } from '../DistributeToTeamsWidget'

const mockStore = configureMockStore([thunk])

const teamsState = fromJS({
    all: {
        1: { id: 1, name: 'Team A' },
        2: { id: 2, name: 'Team B' },
        3: { id: 3, name: 'Team C' },
    },
})

const createStore = () => mockStore({ teams: teamsState })

describe('<DistributeToTeamsWidget />', () => {
    const defaultProps = {
        onChange: jest.fn(),
        value: JSON.stringify([
            { team_id: 1, percentage: 50 },
            { team_id: 2, percentage: 50 },
        ]),
        className: 'test-class',
    }

    beforeEach(() => {
        defaultProps.onChange.mockClear()
    })

    const renderWidget = (props = {}) =>
        render(
            <Provider store={createStore()}>
                <DistributeToTeamsWidget {...defaultProps} {...props} />
            </Provider>,
        )

    it('should render team rows from JSON string value', () => {
        renderWidget()

        const triggers = screen.getAllByPlaceholderText(
            'Select team',
        ) as HTMLInputElement[]
        expect(triggers.map((trigger) => trigger.value)).toEqual([
            'Team A',
            'Team B',
        ])
    })

    it('should render empty state for invalid JSON', () => {
        renderWidget({ value: 'not json' })

        expect(
            screen.getByRole('button', { name: '+ Add team' }),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Total: 0% — must equal 100%'),
        ).toBeInTheDocument()
    })

    it('should render total indicator as valid when sum is 100', () => {
        renderWidget()

        expect(screen.getByText('Total: 100% ✓')).toBeInTheDocument()
    })

    it('should render total indicator as invalid when sum is not 100', () => {
        renderWidget({
            value: JSON.stringify([
                { team_id: 1, percentage: 30 },
                { team_id: 2, percentage: 30 },
            ]),
        })

        expect(
            screen.getByText('Total: 60% — must equal 100%'),
        ).toBeInTheDocument()
    })

    it('should call onChange with updated JSON when team is selected', async () => {
        const user = userEvent.setup()
        renderWidget({
            value: JSON.stringify([
                { team_id: '', percentage: 50 },
                { team_id: 2, percentage: 50 },
            ]),
        })

        const triggers = screen.getAllByPlaceholderText('Select team')
        await user.click(triggers[0])
        await user.click(screen.getByRole('option', { name: 'Team A' }))

        expect(defaultProps.onChange).toHaveBeenCalledWith(
            JSON.stringify([
                { team_id: 1, percentage: 50 },
                { team_id: 2, percentage: 50 },
            ]),
        )
    })

    it('should call onChange with updated JSON when percentage changes', () => {
        renderWidget()

        const inputs = screen.getAllByRole('spinbutton')
        fireEvent.change(inputs[0], { target: { value: '25' } })

        expect(defaultProps.onChange).toHaveBeenCalledWith(
            JSON.stringify([
                { team_id: 1, percentage: 25 },
                { team_id: 2, percentage: 50 },
            ]),
        )
    })

    it('should add a new team row when "+ Add team" is clicked', () => {
        renderWidget()

        fireEvent.click(screen.getByRole('button', { name: '+ Add team' }))

        expect(defaultProps.onChange).toHaveBeenCalledWith(
            JSON.stringify([
                { team_id: 1, percentage: 50 },
                { team_id: 2, percentage: 50 },
                { team_id: '', percentage: 0 },
            ]),
        )
    })

    it('should remove a team row when remove button is clicked', () => {
        renderWidget()

        const removeButtons = screen.getAllByRole('button', { name: '×' })
        fireEvent.click(removeButtons[0])

        expect(defaultProps.onChange).toHaveBeenCalledWith(
            JSON.stringify([{ team_id: 2, percentage: 50 }]),
        )
    })

    it('should filter teams by search text', async () => {
        const user = userEvent.setup()
        renderWidget({
            value: JSON.stringify([
                { team_id: '', percentage: 50 },
                { team_id: 2, percentage: 50 },
            ]),
        })

        const triggers = screen.getAllByPlaceholderText('Select team')
        await user.click(triggers[0])
        await user.type(screen.getByRole('searchbox'), 'Team A')

        const optionTexts = screen
            .getAllByRole('option')
            .map((option) => option.textContent)
        expect(optionTexts).toContain('Team A')
        expect(optionTexts).not.toContain('Team C')
    })

    it('should filter out already-selected teams from other row dropdowns', async () => {
        const user = userEvent.setup()
        renderWidget()

        const triggers = screen.getAllByPlaceholderText('Select team')
        // Second row should not show Team A (id=1) since it's selected in first row
        await user.click(triggers[1])

        const optionTexts = screen
            .getAllByRole('option')
            .map((option) => option.textContent)
        expect(optionTexts).not.toContain('Team A')
        expect(optionTexts).toContain('Team C')
    })

    it('should not show remove button when only one team row', () => {
        renderWidget({
            value: JSON.stringify([{ team_id: 1, percentage: 100 }]),
        })

        expect(
            screen.queryByRole('button', { name: '×' }),
        ).not.toBeInTheDocument()
    })

    it('should handle missing className', () => {
        render(
            <Provider store={createStore()}>
                <DistributeToTeamsWidget
                    onChange={defaultProps.onChange}
                    value={defaultProps.value}
                />
            </Provider>,
        )

        expect(
            screen.getByRole('button', { name: '+ Add team' }),
        ).toBeInTheDocument()
    })

    it('should handle zero and empty percentage values', () => {
        renderWidget({
            value: JSON.stringify([
                { team_id: 1, percentage: 0 },
                { team_id: 2, percentage: 0 },
            ]),
        })

        expect(
            screen.getByText('Total: 0% — must equal 100%'),
        ).toBeInTheDocument()
    })

    it('should handle non-numeric percentage input', () => {
        renderWidget()

        const inputs = screen.getAllByRole('spinbutton')
        fireEvent.change(inputs[0], { target: { value: '' } })

        expect(defaultProps.onChange).toHaveBeenCalledWith(
            JSON.stringify([
                { team_id: 1, percentage: 0 },
                { team_id: 2, percentage: 50 },
            ]),
        )
    })

    it('should handle array value (not just JSON string)', () => {
        renderWidget({
            value: [
                { team_id: 1, percentage: 60 },
                { team_id: 2, percentage: 40 },
            ],
        })

        const triggers = screen.getAllByPlaceholderText(
            'Select team',
        ) as HTMLInputElement[]
        expect(triggers.map((trigger) => trigger.value)).toEqual([
            'Team A',
            'Team B',
        ])
        expect(screen.getByText('Total: 100% ✓')).toBeInTheDocument()
    })
})
