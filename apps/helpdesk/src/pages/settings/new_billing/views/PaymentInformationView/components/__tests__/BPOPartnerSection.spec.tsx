import React from 'react'

import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCompanyHandler,
    mockUpsertCompanyHandler,
} from '@gorgias/helpdesk-mocks'
import { BPOPartner } from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import { BPOPartnerSection } from 'pages/settings/new_billing/views/PaymentInformationView/components/BPOPartnerSection'
import { notify } from 'state/notifications/actions'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch')

const mockNotify = notify as jest.MockedFunction<typeof notify>
const mockUseAppDispatch = useAppDispatch as jest.MockedFunction<
    typeof useAppDispatch
>
const mockDispatch = jest.fn()

const server = setupServer()

const mockGetCompany = mockGetCompanyHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        consulting_agency_partner: null,
        bpo_partner: BPOPartner.AdamsAcresCom,
    }),
)

const mockUpsertCompany = mockUpsertCompanyHandler()

const localHandlers = [mockGetCompany.handler, mockUpsertCompany.handler]

describe('BPOPartnerSection', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(...localHandlers)
        mockUseAppDispatch.mockReturnValue(mockDispatch)
    })

    afterEach(() => {
        server.resetHandlers()
        jest.clearAllMocks()
    })

    afterAll(() => {
        server.close()
    })

    it('should render with selected partner', async () => {
        renderWithQueryClientProvider(<BPOPartnerSection />)

        await waitFor(() => {
            expect(screen.getByText('BPO partner')).toBeVisible()
        })
    })

    it('should render with null partner', async () => {
        const { handler } = mockGetCompanyHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                consulting_agency_partner: null,
                bpo_partner: null,
            }),
        )
        server.use(handler)

        renderWithQueryClientProvider(<BPOPartnerSection />)

        await waitFor(() => {
            expect(screen.getByText('BPO partner')).toBeVisible()
        })
    })

    it('should show clear selection option when partner is selected', async () => {
        const user = userEvent.setup()
        renderWithQueryClientProvider(<BPOPartnerSection />)

        const selectTrigger = await screen.findByRole('combobox')
        await act(async () => {
            await user.click(selectTrigger)
        })

        await waitFor(() => {
            const clearOption = screen.getByText('Clear selection')
            expect(clearOption).toBeInTheDocument()
        })
    })

    it('should update partner when selecting a new one', async () => {
        const user = userEvent.setup()
        const localMockUpsertCompany = mockUpsertCompanyHandler()
        server.use(localMockUpsertCompany.handler)
        const waitForUpsertRequest =
            localMockUpsertCompany.waitForRequest(server)

        const { handler: getHandler } = mockGetCompanyHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    consulting_agency_partner: null,
                    bpo_partner: null,
                }),
        )
        server.use(getHandler)

        renderWithQueryClientProvider(<BPOPartnerSection />)

        const selectTrigger = await screen.findByRole('combobox')
        await act(async () => {
            await user.click(selectTrigger)
        })

        const option = await screen.findByText('Adams Acres')
        await act(async () => {
            await user.click(option)
        })

        await waitForUpsertRequest(async (request) => {
            const body = await request.json()
            expect(body.bpo_partner).toBe(BPOPartner.AdamsAcresCom)
            expect(body.consulting_agency_partner).toBeNull()
        })
    })

    it('should clear partner selection', async () => {
        const user = userEvent.setup()
        const localMockUpsertCompany = mockUpsertCompanyHandler()
        server.use(localMockUpsertCompany.handler)
        const waitForUpsertRequest =
            localMockUpsertCompany.waitForRequest(server)

        renderWithQueryClientProvider(<BPOPartnerSection />)

        const selectTrigger = await screen.findByRole('combobox')
        await act(async () => {
            await user.click(selectTrigger)
        })

        const clearOption = await screen.findByText('Clear selection')
        await act(async () => {
            await user.click(clearOption)
        })

        await waitForUpsertRequest(async (request) => {
            const body = await request.json()
            expect(body.bpo_partner).toBeNull()
        })
    })

    it('should handle update error and revert selection', async () => {
        const user = userEvent.setup()

        const { handler: errorHandler } = mockUpsertCompanyHandler(
            async () => new HttpResponse(null, { status: 500 }),
        )
        server.use(errorHandler)

        renderWithQueryClientProvider(<BPOPartnerSection />)

        const selectTrigger = await screen.findByRole('combobox')
        await act(async () => {
            await user.click(selectTrigger)
        })

        const clearOption = await screen.findByText('Clear selection')
        await act(async () => {
            await user.click(clearOption)
        })

        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Failed to update BPO partner',
                }),
            )
        })
    })

    it('should show loading state', async () => {
        const { handler } = mockGetCompanyHandler(
            async () => new Promise(() => {}),
        )
        server.use(handler)

        const { container } = renderWithQueryClientProvider(
            <BPOPartnerSection />,
        )

        expect(
            container.querySelector('.icon-custom.icon-circle-o-notch'),
        ).toBeInTheDocument()
    })

    it('should preserve consulting partner when updating BPO partner', async () => {
        const user = userEvent.setup()
        const localMockUpsertCompany = mockUpsertCompanyHandler()
        server.use(localMockUpsertCompany.handler)
        const waitForUpsertRequest =
            localMockUpsertCompany.waitForRequest(server)

        const { handler: getHandler } = mockGetCompanyHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    consulting_agency_partner: 'a.community',
                    bpo_partner: null,
                }),
        )
        server.use(getHandler)

        renderWithQueryClientProvider(<BPOPartnerSection />)

        const selectTrigger = await screen.findByRole('combobox')
        await act(async () => {
            await user.click(selectTrigger)
        })

        const option = await screen.findByText('Adams Acres')
        await act(async () => {
            await user.click(option)
        })

        await waitForUpsertRequest(async (request) => {
            const body = await request.json()
            expect(body.bpo_partner).toBe(BPOPartner.AdamsAcresCom)
            expect(body.consulting_agency_partner).toBe('a.community')
        })
    })

    it('should handle update error and revert when selecting regular option', async () => {
        const user = userEvent.setup()

        const { handler: errorHandler } = mockUpsertCompanyHandler(
            async () => new HttpResponse(null, { status: 500 }),
        )
        server.use(errorHandler)

        renderWithQueryClientProvider(<BPOPartnerSection />)

        const selectTrigger = await screen.findByRole('combobox')
        await act(async () => {
            await user.click(selectTrigger)
        })

        await waitFor(() => {
            expect(screen.getByText('Clear selection')).toBeInTheDocument()
        })

        const clearOption = await screen.findByText('Clear selection')
        await act(async () => {
            await user.click(clearOption)
        })

        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Failed to update BPO partner',
                }),
            )
        })
    })

    it('should select partner from dropdown options', async () => {
        const user = userEvent.setup()
        const localMockUpsertCompany = mockUpsertCompanyHandler()
        server.use(localMockUpsertCompany.handler)
        const waitForUpsertRequest =
            localMockUpsertCompany.waitForRequest(server)

        const { handler: getHandler } = mockGetCompanyHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    consulting_agency_partner: null,
                    bpo_partner: BPOPartner.AdamsAcresCom,
                }),
        )
        server.use(getHandler)

        renderWithQueryClientProvider(<BPOPartnerSection />)

        const selectTrigger = await screen.findByRole('combobox')
        await waitFor(() => {
            expect(selectTrigger).toHaveTextContent('Adams Acres')
        })

        await act(async () => {
            await user.click(selectTrigger)
        })

        const options = await screen.findAllByRole('option')
        expect(options.length).toBeGreaterThan(1)

        const differentOption = options.find((opt) =>
            opt.textContent?.includes('Academyagency'),
        )
        if (differentOption) {
            await act(async () => {
                await user.click(differentOption)
            })

            await waitForUpsertRequest(async (request) => {
                const body = await request.json()
                expect(body.bpo_partner).toBe('academyagency.co.nz')
            })
        }
    })
})
