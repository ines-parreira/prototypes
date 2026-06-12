import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { toast } from '@gorgias/axiom'
import {
    mockUpdateSlaPolicyHandler,
    mockUpdateSlaPolicyResponse,
} from '@gorgias/helpdesk-mocks'

import { SLAListController } from '../SLAListController'
import { useGetSLAPolicies } from '../useGetSLAPolicies'

jest.mock('../useGetSLAPolicies')
const mockUseGetSLAPolicies = useGetSLAPolicies as jest.Mock

jest.mock('pages/settings/SLAs/features/Loader/Loader', () => ({
    Loader: () => <div>Loader</div>,
}))
jest.mock('pages/settings/SLAs/features/LandingPage/LandingPage', () => ({
    LandingPage: () => <div>LandingPage</div>,
}))
jest.mock('../../views/SLAListView', () => ({
    SLAListView: ({
        onTogglePolicy,
        onPolicyPriorityChange,
    }: {
        onTogglePolicy: (id: string, active: boolean) => void
        onPolicyPriorityChange: (id: string, priority: number) => void
    }) => (
        <div>
            <button
                type="button"
                onClick={() => onTogglePolicy('policy-1', true)}
            >
                toggle-policy
            </button>
            <button
                type="button"
                onClick={() => onPolicyPriorityChange('policy-1', 5)}
            >
                change-priority
            </button>
        </div>
    ),
}))

jest.mock('hooks/useAppDispatch', () => ({ useAppDispatch: jest.fn() }))

const server = setupServer()

describe('<SLAListController />', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(
            mockUpdateSlaPolicyHandler(async () =>
                HttpResponse.json(mockUpdateSlaPolicyResponse()),
            ).handler,
        )
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should render Loader component when isLoading is true', () => {
        mockUseGetSLAPolicies.mockImplementation(() => ({
            data: [],
            isLoading: true,
        }))

        const { getByText } = render(<SLAListController />)

        expect(getByText('Loader')).toBeInTheDocument()
    })

    it('should render LandingPage component when isLoading is false and there is no data to display', () => {
        mockUseGetSLAPolicies.mockImplementation(() => ({
            data: [],
            isLoading: false,
        }))

        const { getByText } = render(<SLAListController />)

        expect(getByText('LandingPage')).toBeInTheDocument()
    })

    it('should render SLAListView component when isLoading is false and there is data to display', () => {
        mockUseGetSLAPolicies.mockImplementation(() => ({
            data: [{}],
            isLoading: false,
        }))

        const { getByText } = render(<SLAListController />)

        expect(getByText('toggle-policy')).toBeInTheDocument()
    })

    describe('toast notifications', () => {
        afterEach(() => {
            toast.dismiss()
        })

        it('should show success toast when togglePolicy succeeds', async () => {
            mockUseGetSLAPolicies.mockImplementation(() => ({
                data: [{}],
                isLoading: false,
                refetch: jest.fn(),
            }))

            const { getByText } = render(<SLAListController />)
            getByText('toggle-policy').click()

            await waitFor(() => {
                expect(
                    screen.getByRole('status', { name: 'SLA policy toggled' }),
                ).toHaveAttribute('data-intent', 'success')
            })
        })

        it('should show error toast when togglePolicy fails', async () => {
            mockUseGetSLAPolicies.mockImplementation(() => ({
                data: [{}],
                isLoading: false,
                refetch: jest.fn(),
            }))
            server.use(
                mockUpdateSlaPolicyHandler(async () =>
                    HttpResponse.json(mockUpdateSlaPolicyResponse(), {
                        status: 500,
                    }),
                ).handler,
            )

            const { getByText } = render(<SLAListController />)
            getByText('toggle-policy').click()

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Failed to toggle SLA policy',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })

        it('should show error toast when changePolicyPriority fails', async () => {
            mockUseGetSLAPolicies.mockImplementation(() => ({
                data: [{}],
                isLoading: false,
                refetch: jest.fn(),
            }))
            server.use(
                mockUpdateSlaPolicyHandler(async () =>
                    HttpResponse.json(mockUpdateSlaPolicyResponse(), {
                        status: 500,
                    }),
                ).handler,
            )

            const { getByText } = render(<SLAListController />)
            getByText('change-priority').click()

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Failed to change SLA policy priority',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })
    })
})
