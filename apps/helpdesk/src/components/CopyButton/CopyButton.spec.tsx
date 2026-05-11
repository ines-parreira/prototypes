import React from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import copy from 'copy-to-clipboard'
import { fromJS } from 'immutable'

import { toast } from '@gorgias/axiom'

import { IntegrationContext } from 'providers/infobar/IntegrationContext'

import CopyButton from './CopyButton'

jest.mock('copy-to-clipboard', () => jest.fn())
const copyMock = copy as jest.MockedFunction<typeof copy>

jest.mock('@repo/logging')

describe('<Copy/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('should copy on clipboard', () => {
        render(
            <IntegrationContext.Provider
                value={{
                    integration: fromJS({ type: 'type' }),
                    integrationId: 1,
                }}
            >
                <CopyButton value="test" />
            </IntegrationContext.Provider>,
            {
                storeState: {
                    currentAccount: fromJS({ domain: 'domain' }),
                },
            },
        )

        fireEvent.click(screen.getByRole('button'))
        expect(copyMock).toHaveBeenCalledWith('test')
    })

    it('should notify the user about the copy', async () => {
        render(<CopyButton value="test" />)

        fireEvent.click(screen.getByRole('button'))
        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Copied!' }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should notify the user about the copy with a custom message', async () => {
        render(<CopyButton value="test" onCopyMessage="Test Message" />)

        fireEvent.click(screen.getByRole('button'))
        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Test Message' }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should notify the user about the copy error', async () => {
        copyMock.mockImplementation(() => {
            throw new Error('User not found')
        })
        render(<CopyButton value="test" onCopyMessage="Test Message" />)

        fireEvent.click(screen.getByRole('button'))
        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Failed to copy' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
