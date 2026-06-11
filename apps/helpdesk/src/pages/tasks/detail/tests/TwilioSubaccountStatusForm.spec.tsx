import React from 'react'

import client from '@repo/api-resources'
import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import { toast } from '@gorgias/axiom'

import {
    TwilioSubaccountStatus,
    TwilioSubaccountStatusForm,
} from '../TwilioSubaccountStatusForm'

const mockedServer = new MockAdapter(client)

const statusData = {
    status: TwilioSubaccountStatus.Suspended,
    sub_account_sid: 'SID_123',
}

describe('<TwilioSubaccountStatusForm />', () => {
    beforeEach(() => {
        mockedServer.reset()
        mockedServer.onGet('/api/integrations/phone/tasks').reply(200, {
            data: statusData,
        })
    })

    afterEach(() => {
        toast.dismiss()
    })

    describe('render()', () => {
        it('should render with the Twillio subaccount details', async () => {
            const { container, queryByText } = render(
                <TwilioSubaccountStatusForm />,
            )

            await waitFor(() => {
                expect(queryByText('Twilio Subaccount SID')).not.toBe(null)
                expect(queryByText('Status')).not.toBe(null)
                expect(container).toMatchSnapshot()
            })
        })

        it('should allow updating the status', async () => {
            mockedServer.onPost('/api/integrations/phone/tasks').reply(200, {})
            const { queryByText, getByText } = render(
                <TwilioSubaccountStatusForm />,
            )

            await waitFor(() => {
                expect(queryByText('Twilio Subaccount SID')).not.toBe(null)
                expect(queryByText('Status')).not.toBe(null)
            })

            fireEvent.click(getByText('Active'))
            fireEvent.click(getByText('Save changes'))

            await waitFor(() => {
                expect(mockedServer.history.post.length).toBe(1)
                expect(mockedServer.history.post[0].data).toBe(
                    JSON.stringify({
                        name: 'set_subaccount_status',
                        params: {
                            status: 'active',
                            sub_account_sid: 'SID_123',
                        },
                    }),
                )
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Twilio Subaccount updated successfully.',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')
        })

        it('shows an error toast when fetching subaccount data fails', async () => {
            mockedServer.reset()
            mockedServer.onGet('/api/integrations/phone/tasks').reply(500)

            render(<TwilioSubaccountStatusForm />)

            const toastEl = await screen.findByRole('status', {
                name: 'Failed to fetch Twilio Subaccount data',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })

        it('shows an error toast when trying to set status to Closed', async () => {
            mockedServer.reset()
            mockedServer.onGet('/api/integrations/phone/tasks').reply(200, {
                data: {
                    status: TwilioSubaccountStatus.Active,
                    sub_account_sid: 'SID_123',
                },
            })
            const { getByText } = render(<TwilioSubaccountStatusForm />)

            await waitFor(() => {
                expect(getByText('Active')).toBeInTheDocument()
            })

            fireEvent.click(getByText('Closed'))
            fireEvent.click(getByText('Save changes'))

            const toastEl = await screen.findByRole('status', {
                name: 'Cannot use this feature to Close a Subaccount',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })

        it('shows an error toast when the update request fails', async () => {
            mockedServer.onPost('/api/integrations/phone/tasks').reply(500, {
                error: { msg: 'server error' },
            })
            const { getByText } = render(<TwilioSubaccountStatusForm />)

            await waitFor(() => {
                expect(getByText('Suspended')).toBeInTheDocument()
            })

            fireEvent.click(getByText('Active'))
            fireEvent.click(getByText('Save changes'))

            const toastEl = await screen.findByRole('status', {
                name: 'Failed to update subaccount status',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
