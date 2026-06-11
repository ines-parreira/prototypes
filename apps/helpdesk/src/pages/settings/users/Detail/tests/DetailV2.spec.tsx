import React from 'react'

import { assumeMock, getLastMockCall, render, userEvent } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import { UserRole } from 'config/types/user'
import { agents } from 'fixtures/agents'
import { useAppSelector } from 'hooks/useAppSelector'
import { getAccountOwnerId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'

import { DetailV2 } from '../DetailV2'
import { Footer } from '../Footer'
import { useGetAgentWithEffects } from '../hooks/useGetAgentWithEffect'
import { Info } from '../Info'
import { Role } from '../Role'
import { Statuses } from '../Statuses'

const mockCreateUser = jest.fn()
const mockUpdateUser = jest.fn()

jest.mock('@repo/users', () => ({
    useCreateUser: () => ({ mutateAsync: mockCreateUser, isLoading: false }),
    useUpdateUser: () => ({ mutateAsync: mockUpdateUser, isLoading: false }),
}))
jest.mock('hooks/useAppDispatch', () => ({ useAppDispatch: () => jest.fn() }))
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
jest.mock('hooks/useAppSelector')
jest.mock('state/currentAccount/selectors')
jest.mock('state/currentUser/selectors')
jest.mock('pages/common/components/Loader/Loader', () => ({
    __esModule: true,
    Loader: jest.fn(() => <div>loader</div>),
}))
jest.mock('../hooks/useGetAgentWithEffect')
jest.mock('../Statuses')
jest.mock('../Info')
jest.mock('../Role')
jest.mock('../Footer')

const ACCOUNT_OWNER_ID = 1
const CURRENT_USER_ID = 2

const useParamsMock = assumeMock(useParams)
const useGetAgentWithEffectsMock = assumeMock(useGetAgentWithEffects)
const mockedUseAppSelector = assumeMock(useAppSelector)
const mockedStatuses = assumeMock(Statuses)
const mockedInfo = assumeMock(Info)
const mockedRole = assumeMock(Role)
const mockedFooter = assumeMock(Footer)

const setEditableAgentState = (state: {
    name: string
    email: string
    role: UserRole
}) => {
    act(() => {
        getLastMockCall(useGetAgentWithEffectsMock)[0].setAgentState(state)
    })
}

beforeEach(() => {
    mockedUseAppSelector.mockImplementation((selector: unknown) => {
        if (selector === getAccountOwnerId) return ACCOUNT_OWNER_ID
        if (selector === getCurrentUserId) return CURRENT_USER_ID
        return undefined
    })
    mockedStatuses.mockReturnValue(<div />)
    mockedInfo.mockReturnValue(<div />)
    mockedRole.mockReturnValue(<div />)
    // The real Footer renders in a sticky PanelFooter outside the <form> and
    // associates its submit button via the `form` attribute; mirror that so a
    // click still submits the form.
    mockedFooter.mockImplementation(({ formId }) => (
        <button type="submit" form={formId}>
            Save
        </button>
    ))
    useGetAgentWithEffectsMock.mockReturnValue({
        rawData: agents[0],
        isLoading: false,
    })
})

afterEach(() => {
    jest.clearAllMocks()
})

describe('DetailV2', () => {
    it('shows a loader while an existing user is loading', () => {
        useParamsMock.mockReturnValue({ id: '5' })
        useGetAgentWithEffectsMock.mockReturnValue({
            rawData: undefined,
            isLoading: true,
        })

        render(<DetailV2 />)

        expect(screen.getByText('loader')).toBeInTheDocument()
    })

    it('renders nothing when an existing user cannot be found', () => {
        useParamsMock.mockReturnValue({ id: '5' })
        useGetAgentWithEffectsMock.mockReturnValue({
            rawData: undefined,
            isLoading: false,
        })

        const { container } = render(<DetailV2 />)

        expect(container).toBeEmptyDOMElement()
    })

    it('creates a user with trimmed name and lowercased email', async () => {
        const user = userEvent.setup()
        mockCreateUser.mockResolvedValue({ data: { email: 'ada@example.com' } })
        useParamsMock.mockReturnValue({ id: '' })

        render(<DetailV2 />)
        setEditableAgentState({
            name: ' Ada ',
            email: ' ADA@example.com ',
            role: UserRole.BasicAgent,
        })
        await user.click(screen.getByText('Save'))

        expect(mockCreateUser).toHaveBeenCalledWith({
            data: {
                name: 'Ada',
                email: 'ada@example.com',
                role: { name: 'basic-agent' },
            },
        })
        expect(
            await screen.findByRole('status', { name: /Team member created/ }),
        ).toBeInTheDocument()
    })

    it('blocks creation when email or role is missing', async () => {
        const user = userEvent.setup()
        useParamsMock.mockReturnValue({ id: '' })

        render(<DetailV2 />)
        setEditableAgentState({
            name: 'No Email',
            email: '',
            role: UserRole.BasicAgent,
        })
        await user.click(screen.getByText('Save'))

        expect(mockCreateUser).not.toHaveBeenCalled()
        expect(
            await screen.findByRole('status', {
                name: /Email and role are required/,
            }),
        ).toBeInTheDocument()
    })

    it('updates an existing user and drops the role when editing yourself', async () => {
        const user = userEvent.setup()
        mockUpdateUser.mockResolvedValue({
            data: { email: 'self@example.com' },
        })
        useParamsMock.mockReturnValue({ id: '2' })

        render(<DetailV2 />)
        setEditableAgentState({
            name: 'Myself',
            email: 'self@example.com',
            role: UserRole.Admin,
        })
        await user.click(screen.getByText('Save'))

        expect(mockUpdateUser).toHaveBeenCalledWith({
            id: 2,
            data: { name: 'Myself', email: 'self@example.com' },
        })
        expect(
            await screen.findByRole('status', { name: /Team member updated/ }),
        ).toBeInTheDocument()
    })

    it('surfaces an error toast when the mutation fails', async () => {
        const user = userEvent.setup()
        mockCreateUser.mockRejectedValue(new Error('boom'))
        useParamsMock.mockReturnValue({ id: '' })

        render(<DetailV2 />)
        setEditableAgentState({
            name: 'Ada',
            email: 'ada@example.com',
            role: UserRole.BasicAgent,
        })
        await user.click(screen.getByText('Save'))

        expect(
            await screen.findByRole('status', {
                name: /Error while creating user/,
            }),
        ).toBeInTheDocument()
    })
})
