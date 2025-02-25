import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import { useListTeams } from 'models/team/queries'

import VoiceIntegrationPreferencesTeamSelect, {
    NO_TEAM_SELECTED_LABEL,
} from '../VoiceIntegrationPreferencesTeamSelect'

jest.mock('models/team/queries', () => ({
    useListTeams: jest.fn(),
}))

describe('<VoiceIntegrationPreferencesTeamSelect />', () => {
    const mockTeams = [
        { id: 1, name: 'Team 1', members: [] },
        { id: 2, name: 'Team 2', members: [{}, {}] },
        { id: 3, name: 'Team 3', members: [{}] },
    ]
    const handleChange = jest.fn()

    it('should display the selected team name', () => {
        ;(useListTeams as jest.Mock).mockReturnValue({
            data: { data: { data: mockTeams } },
            isLoading: false,
            error: null,
        })

        const { getByText } = render(
            <VoiceIntegrationPreferencesTeamSelect
                value={2}
                onChange={handleChange}
            />,
        )

        expect(getByText('Team 2')).toBeInTheDocument()
    })

    it('should open the dropdown when clicked', () => {
        ;(useListTeams as jest.Mock).mockReturnValue({
            data: { data: { data: mockTeams } },
            isLoading: false,
            error: null,
        })

        const { getByText } = render(
            <VoiceIntegrationPreferencesTeamSelect onChange={handleChange} />,
        )

        const selectInput = getByText(NO_TEAM_SELECTED_LABEL)
        fireEvent.focus(selectInput)

        expect(getByText('Team 1')).toBeInTheDocument()
        expect(getByText('Team 2')).toBeInTheDocument()
        expect(getByText('2 members')).toBeInTheDocument()
        expect(getByText('Team 3')).toBeInTheDocument()
        expect(getByText('1 member')).toBeInTheDocument()
    })

    it('should call the onChange function when a team is selected', () => {
        ;(useListTeams as jest.Mock).mockReturnValue({
            data: { data: { data: mockTeams } },
            isLoading: false,
            error: null,
        })

        const { getByText } = render(
            <VoiceIntegrationPreferencesTeamSelect onChange={handleChange} />,
        )

        const selectInput = getByText(NO_TEAM_SELECTED_LABEL)
        fireEvent.focus(selectInput)

        const team2Option = getByText('Team 2')
        fireEvent.click(team2Option)
        expect(handleChange).toHaveBeenCalledWith(2)
    })

    it('should disable input when there is an error', () => {
        ;(useListTeams as jest.Mock).mockReturnValue({
            data: null,
            isLoading: false,
            error: new Error('error'),
        })

        const { getByText, queryByText } = render(
            <VoiceIntegrationPreferencesTeamSelect onChange={handleChange} />,
        )

        const selectInput = getByText(NO_TEAM_SELECTED_LABEL)
        fireEvent.focus(selectInput)

        expect(getByText('Error: Unable to retrieve teams')).toBeInTheDocument()
        expect(queryByText('Search')).not.toBeInTheDocument()
    })

    it('should be able to clear team selection', () => {
        ;(useListTeams as jest.Mock).mockReturnValue({
            data: { data: { data: mockTeams } },
            isLoading: false,
            error: null,
        })

        const { getByText } = render(
            <VoiceIntegrationPreferencesTeamSelect
                value={2}
                onChange={handleChange}
            />,
        )

        const selectInput = getByText('Team 2')
        fireEvent.focus(selectInput)

        const noTeamOption = getByText(NO_TEAM_SELECTED_LABEL)
        fireEvent.click(noTeamOption)
        expect(handleChange).toHaveBeenCalledWith(null)
    })

    it('should display message when there is no selected team', () => {
        ;(useListTeams as jest.Mock).mockReturnValue({
            data: { data: { data: mockTeams } },
            isLoading: false,
            error: null,
        })

        const { getByText } = render(
            <VoiceIntegrationPreferencesTeamSelect onChange={handleChange} />,
        )

        expect(getByText(NO_TEAM_SELECTED_LABEL)).toBeInTheDocument()
    })
})
