import {
    FeatureFlagKey,
    useAreFlagsLoading,
    useFlag,
} from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { setupServer } from 'msw/node'

import {
    mockArchiveSlaPolicyHandler,
    mockCreateSlaPolicyHandler,
    mockGetSlaPolicyHandler,
    mockUpdateSlaPolicyHandler,
} from '@gorgias/helpdesk-mocks'

import { appQueryClient } from 'api/queryClient'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import SLAFormController from '../SLAFormController'

const server = setupServer()

const mockGetSlaPolicy = mockGetSlaPolicyHandler()
const mockCreateSlaPolicy = mockCreateSlaPolicyHandler()
const mockUpdateSlaPolicy = mockUpdateSlaPolicyHandler()
const mockArchiveSlaPolicy = mockArchiveSlaPolicyHandler()

const localHandlers = [
    mockGetSlaPolicy.handler,
    mockCreateSlaPolicy.handler,
    mockUpdateSlaPolicy.handler,
    mockArchiveSlaPolicy.handler,
]

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
})

afterEach(() => {
    server.resetHandlers()
    appQueryClient.clear()
})

afterAll(() => {
    server.close()
})

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
    useAreFlagsLoading: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

const mockUseAreFlagsLoading = assumeMock(useAreFlagsLoading)

describe('SLAFormController', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should display loader while feature flags are loading', () => {
        mockUseAreFlagsLoading.mockReturnValue(true)

        const { container } = renderWithStoreAndQueryClientAndRouter(
            <SLAFormController />,
            {},
            {
                route: '/app/settings/sla/new',
                path: '/app/settings/sla/:policyId',
            },
        )

        expect(container.querySelector('.loader')).toBeInTheDocument()
    })

    it('should not display loader when feature flags are loaded (FF is off)', () => {
        useFlagMock.mockImplementation((flagName: string) => {
            if (flagName === FeatureFlagKey.VoiceSLA) {
                return false
            }
        })
        mockUseAreFlagsLoading.mockReturnValue(false)

        renderWithStoreAndQueryClientAndRouter(
            <SLAFormController />,
            {},
            {
                route: '/app/settings/sla/new',
                path: '/app/settings/sla/:policyId',
            },
        )

        expect(screen.getByRole('form')).toBeInTheDocument()
    })

    it('should not display loader when feature flags are loaded', () => {
        useFlagMock.mockImplementation((flagName: string) => {
            if (flagName === FeatureFlagKey.VoiceSLA) {
                return true
            }
        })
        mockUseAreFlagsLoading.mockReturnValue(false)

        renderWithStoreAndQueryClientAndRouter(
            <SLAFormController />,
            {},
            {
                route: '/app/settings/sla/new',
                path: '/app/settings/sla/:policyId',
            },
        )

        expect(screen.getByRole('form')).toBeInTheDocument()
    })
})
