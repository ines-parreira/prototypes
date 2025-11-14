import React from 'react'

import { assumeMock, getLastMockCall, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { useParams } from 'react-router-dom'

import { User, UserRole } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import { getAccountOwnerId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { StoreState } from 'state/types'

import { navigateBackToUserList } from '../constants'
import { Detail } from '../Detail'
import { Footer } from '../Footer'
import { Header } from '../Header'
import { useGetAgentWithEffects } from '../hooks/useGetAgentWithEffect'
import { Info } from '../Info'
import { Role } from '../Role'
import { Statuses } from '../Statuses'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
jest.mock('hooks/useAppSelector')
jest.mock('state/currentAccount/selectors')
jest.mock('state/currentUser/selectors')
jest.mock('pages/common/components/Loader/Loader', () => ({
    __esModule: true,
    default: jest.fn(() => <div>loader</div>),
}))
jest.mock('../hooks/useGetAgentWithEffect')
jest.mock('../Header')
jest.mock('../Statuses')
jest.mock('../Info')
jest.mock('../Role')
jest.mock('../Footer')

const mockedUseAppSelector = assumeMock(useAppSelector)
mockedUseAppSelector.mockImplementation(
    (selector: (state: StoreState) => unknown) => selector({} as StoreState),
)
const mockedUpdateAgent = jest.fn(() => undefined)
jest.mock('hooks/agents/useUpdateAgent', () => ({
    useUpdateAgent: () => ({
        mutate: mockedUpdateAgent,
        isLoading: false,
    }),
}))
const mockedCreateAgent = jest.fn(() => undefined)
jest.mock('hooks/agents/useCreateAgent', () => ({
    useCreateAgent: () => ({
        mutate: mockedCreateAgent,
        isLoading: false,
    }),
}))

const useParamsMock = assumeMock(useParams)
const mockedGetAccountOwnerId = assumeMock(getAccountOwnerId)
const mockedGetCurrentUserId = assumeMock(getCurrentUserId)
const useGetAgentWithEffectsMock = assumeMock(useGetAgentWithEffects)
const mockedHeader = assumeMock(Header)
mockedHeader.mockReturnValue(<div />)
const mockedStatuses = assumeMock(Statuses)
mockedStatuses.mockReturnValue(<div />)
const mockedInfo = assumeMock(Info)
mockedInfo.mockReturnValue(<div />)
const mockedRoles = assumeMock(Role)
mockedRoles.mockReturnValue(<div />)
const mockedFooter = assumeMock(Footer)
mockedFooter.mockReturnValue(<button>Save</button>)

describe('Detail', () => {
    it('should show a loader when loading user data', () => {
        const unsafeAgentId = '1'
        const accountOwnerId = 1
        const currentUserId = 1
        useParamsMock.mockReturnValue({ id: unsafeAgentId })
        useGetAgentWithEffectsMock.mockReturnValue({
            rawData: undefined,
            isLoading: true,
        })

        mockedGetAccountOwnerId.mockReturnValue(accountOwnerId)
        mockedGetCurrentUserId.mockReturnValue(currentUserId)
        render(<Detail />)

        expect(screen.getByText('loader'))
    })

    it('should return nothing is user is not found', () => {
        const unsafeAgentId = '1'
        const accountOwnerId = 1
        const currentUserId = 1
        useParamsMock.mockReturnValue({ id: unsafeAgentId })
        useGetAgentWithEffectsMock.mockReturnValue({
            rawData: undefined,
            isLoading: false,
        })
        mockedGetAccountOwnerId.mockReturnValue(accountOwnerId)
        mockedGetCurrentUserId.mockReturnValue(currentUserId)
        const { container } = render(<Detail />)

        expect(container.firstChild).toBeNull()
    })

    it('should save the details on submit with all the data trimmed and email lowercased', () => {
        const accountOwnerId = 1
        const currentUserId = 1
        const name = ' Spaced '
        const email = ' UppercasedSpace'
        useParamsMock.mockReturnValue({ id: '' })
        useGetAgentWithEffectsMock.mockReturnValue({
            rawData: {} as User,
            isLoading: false,
        })
        mockedGetAccountOwnerId.mockReturnValue(accountOwnerId)
        mockedGetCurrentUserId.mockReturnValue(currentUserId)

        render(<Detail />)
        act(() => {
            getLastMockCall(useGetAgentWithEffectsMock)[0].setAgentState({
                name: name,
                email: email,
                role: UserRole.BasicAgent,
            })
        })
        userEvent.click(screen.getByText('Save'))

        expect(mockedCreateAgent).toHaveBeenCalledWith(
            [
                {
                    email: email.trim().toLocaleLowerCase(),
                    name: name.trim(),
                    role: { name: UserRole.BasicAgent },
                },
            ],
            { onSuccess: navigateBackToUserList },
        )
        expect(mockedCreateAgent).toHaveBeenCalledTimes(1)
    })

    it('should compute the correct props to components', () => {
        const unsafeAgentId = '1'
        const accountOwnerId = 1
        const currentUserId = 1
        useParamsMock.mockReturnValue({ id: unsafeAgentId })
        useGetAgentWithEffectsMock.mockReturnValue({
            rawData: {} as User,
            isLoading: false,
        })
        mockedGetAccountOwnerId.mockReturnValue(accountOwnerId)
        mockedGetCurrentUserId.mockReturnValue(currentUserId)
        render(<Detail />)
        expect(useGetAgentWithEffectsMock).toHaveBeenLastCalledWith({
            agentId: Number(unsafeAgentId),
            isEdit: true,
            setAgentState: expect.any(Function),
            set2FA: expect.any(Function),
            dispatch: mockedDispatch,
        })
        act(() => {
            useGetAgentWithEffectsMock.mock.calls[0][0].setAgentState({
                name: 'M. Love',
                email: 'mister@love.com',
                role: UserRole.BasicAgent,
            })
            useGetAgentWithEffectsMock.mock.calls[0][0].set2FA(true)
        })
        expect(mockedHeader).toHaveBeenLastCalledWith(
            {
                isEdit: true,
                name: 'M. Love',
            },
            {},
        )
        expect(mockedStatuses).toHaveBeenLastCalledWith(
            {
                agentId: 1,
                has2FA: true,
                isAccountOwner: true,
                isViewingAccountOwner: true,
                rawData: {},
                set2FA: expect.any(Function),
            },
            {},
        )
        expect(mockedInfo).toHaveBeenLastCalledWith(
            {
                agentId: 1,
                email: 'mister@love.com',
                isInternal: false,
                isAccountOwner: true,
                isEdit: true,
                isViewingAccountOwner: true,
                name: 'M. Love',
                setAgentState: expect.any(Function),
            },
            {},
        )
        expect(mockedRoles).toHaveBeenLastCalledWith(
            {
                isInternal: false,
                isSelf: true,
                isViewingAccountOwner: true,
                role: 'basic-agent',
                setAgentState: expect.any(Function),
            },
            {},
        )
        expect(mockedFooter).toHaveBeenLastCalledWith(
            {
                agentId: 1,
                agentState: {
                    email: 'mister@love.com',
                    name: 'M. Love',
                    role: 'basic-agent',
                },
                isInternal: false,
                isEdit: true,
                isSaving: false,
                isSelf: true,
                isViewingAccountOwner: true,
                rawData: {},
            },
            {},
        )
    })

    it('should edit the details on submit without role data', () => {
        const unsafeAgentId = '1'
        const accountOwnerId = 1
        const currentUserId = 1
        useParamsMock.mockReturnValue({ id: unsafeAgentId })
        useGetAgentWithEffectsMock.mockReturnValue({
            rawData: {} as User,
            isLoading: false,
        })
        mockedGetAccountOwnerId.mockReturnValue(accountOwnerId)
        mockedGetCurrentUserId.mockReturnValue(currentUserId)

        render(<Detail />)
        userEvent.click(screen.getByText('Save'))

        expect(mockedUpdateAgent).toHaveBeenNthCalledWith(
            1,
            [{ agent: { email: '', name: '' }, id: 1 }],
            { onSuccess: navigateBackToUserList },
        )
    })

    it('should save the details on submit with all the data', () => {
        const accountOwnerId = 1
        const currentUserId = 1
        useParamsMock.mockReturnValue({ id: '' })
        useGetAgentWithEffectsMock.mockReturnValue({
            rawData: {} as User,
            isLoading: false,
        })
        mockedGetAccountOwnerId.mockReturnValue(accountOwnerId)
        mockedGetCurrentUserId.mockReturnValue(currentUserId)

        render(<Detail />)
        userEvent.click(screen.getByText('Save'))

        expect(mockedCreateAgent).toHaveBeenNthCalledWith(
            1,
            [{ email: '', name: '', role: { name: UserRole.BasicAgent } }],
            { onSuccess: navigateBackToUserList },
        )
    })
})
