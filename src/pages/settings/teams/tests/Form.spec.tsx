import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import { useDeleteTeam, useFetchTeam, useUpdateTeam } from 'teams/queries'
import { assumeMock } from 'utils/testing'

import { Form } from '../Form'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    NavLink: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))
const useParamsMock = useParams as jest.Mock

jest.mock('teams/queries')
const useDeleteTeamMock = assumeMock(useDeleteTeam)
const useFetchTeamMock = assumeMock(useFetchTeam)
const useUpdateTeamMock = assumeMock(useUpdateTeam)
const mockAsyncMutateDelete = jest.fn()
const mockMutateUpdate = jest.fn()

describe('<Form />', () => {
    beforeEach(() => {
        useParamsMock.mockReturnValue({})
        useDeleteTeamMock.mockReturnValue({
            mutateAsync: mockAsyncMutateDelete,
        } as unknown as ReturnType<typeof useDeleteTeam>)
        useFetchTeamMock.mockReturnValue({
            data: [],
            isLoading: true,
        } as unknown as ReturnType<typeof useFetchTeam>)
        useUpdateTeamMock.mockReturnValue({
            mutate: mockMutateUpdate,
        } as unknown as ReturnType<typeof useUpdateTeam>)
    })

    it('should render loading state', async () => {
        render(<Form />)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render with team data', async () => {
        const mockData = {
            id: 1,
            name: 'Da best team',
            members: [],
        }
        useParamsMock.mockReturnValue({ id: mockData.id })
        useFetchTeamMock.mockReturnValue({
            data: { data: mockData },
            isLoading: false,
        } as unknown as ReturnType<typeof useFetchTeam>)

        render(<Form />)

        await waitFor(() => {
            expect(
                screen.getByText(`Edit ${mockData.name}`),
            ).toBeInTheDocument()
        })
    })
})
