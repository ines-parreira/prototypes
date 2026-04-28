import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import DistributeToTeamsWidget from '../DistributeToTeamsWidget'

const mockStore = configureMockStore([thunk])

jest.mock('@gorgias/axiom', () => ({
    SelectField: ({
        children,
        items,
        value,
        onChange,
        placeholder,
        onSearchChange,
    }: {
        children: (option: { id: number; label: string }) => React.ReactNode
        items: Array<{ id: number; label: string }>
        value?: { id: number; label: string }
        onChange: (option: { id: number; label: string }) => void
        placeholder?: string
        onSearchChange?: (value: string) => void
    }) => (
        <div data-testid="select-field">
            <span>{value?.label || placeholder}</span>
            {onSearchChange && (
                <input
                    data-testid="search-input"
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            )}
            <ul>
                {items.map((item) => (
                    <li
                        key={item.id}
                        role="option"
                        onClick={() => onChange(item)}
                    >
                        {children(item)}
                    </li>
                ))}
            </ul>
        </div>
    ),
    ListItem: ({ label }: { label: string; id: string | number }) => (
        <span>{label}</span>
    ),
}))

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

        expect(screen.getAllByText('Team A').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('Team B').length).toBeGreaterThanOrEqual(1)
    })

    it('should render empty state for invalid JSON', () => {
        renderWidget({ value: 'not json' })

        expect(screen.getByText('+ Add team')).toBeInTheDocument()
        expect(
            screen.getByText('Total: 0% \u2014 must equal 100%'),
        ).toBeInTheDocument()
    })

    it('should render total indicator as valid when sum is 100', () => {
        renderWidget()

        expect(screen.getByText('Total: 100% \u2713')).toBeInTheDocument()
    })

    it('should render total indicator as invalid when sum is not 100', () => {
        renderWidget({
            value: JSON.stringify([
                { team_id: 1, percentage: 30 },
                { team_id: 2, percentage: 30 },
            ]),
        })

        expect(
            screen.getByText('Total: 60% \u2014 must equal 100%'),
        ).toBeInTheDocument()
    })

    it('should call onChange with updated JSON when team is selected', () => {
        renderWidget({
            value: JSON.stringify([
                { team_id: '', percentage: 50 },
                { team_id: 2, percentage: 50 },
            ]),
        })

        const options = screen.getAllByRole('option')
        const teamAOption = options.find((o) => o.textContent === 'Team A')
        fireEvent.click(teamAOption!)

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

        fireEvent.click(screen.getByText('+ Add team'))

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

        const removeButtons = screen.getAllByText('\u00d7')
        fireEvent.click(removeButtons[0])

        expect(defaultProps.onChange).toHaveBeenCalledWith(
            JSON.stringify([{ team_id: 2, percentage: 50 }]),
        )
    })

    it('should filter teams by search text', () => {
        renderWidget({
            value: JSON.stringify([
                { team_id: '', percentage: 50 },
                { team_id: 2, percentage: 50 },
            ]),
        })

        const searchInputs = screen.getAllByTestId('search-input')
        fireEvent.change(searchInputs[0], { target: { value: 'Team A' } })

        const selectFields = screen.getAllByTestId('select-field')
        const firstRowOptions =
            selectFields[0].querySelectorAll('[role="option"]')
        const optionTexts = Array.from(firstRowOptions).map(
            (o) => o.textContent,
        )
        expect(optionTexts).toContain('Team A')
        expect(optionTexts).not.toContain('Team C')
    })

    it('should filter out already-selected teams from other row dropdowns', () => {
        renderWidget()

        const selectFields = screen.getAllByTestId('select-field')
        // Second row should not show Team A (id=1) since it's selected in first row
        const secondRowOptions =
            selectFields[1].querySelectorAll('[role="option"]')
        const optionTexts = Array.from(secondRowOptions).map(
            (o) => o.textContent,
        )
        expect(optionTexts).not.toContain('Team A')
        expect(optionTexts).toContain('Team C')
    })

    it('should not show remove button when only one team row', () => {
        renderWidget({
            value: JSON.stringify([{ team_id: 1, percentage: 100 }]),
        })

        expect(screen.queryByText('\u00d7')).not.toBeInTheDocument()
    })

    it('should handle missing className', () => {
        const { container } = render(
            <Provider store={createStore()}>
                <DistributeToTeamsWidget
                    onChange={defaultProps.onChange}
                    value={defaultProps.value}
                />
            </Provider>,
        )

        expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle zero and empty percentage values', () => {
        renderWidget({
            value: JSON.stringify([
                { team_id: 1, percentage: 0 },
                { team_id: 2, percentage: 0 },
            ]),
        })

        expect(
            screen.getByText('Total: 0% \u2014 must equal 100%'),
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

        expect(screen.getAllByText('Team A').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('Team B').length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText('Total: 100% \u2713')).toBeInTheDocument()
    })
})
