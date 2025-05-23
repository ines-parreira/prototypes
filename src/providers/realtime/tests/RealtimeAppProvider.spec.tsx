import { ComponentProps } from 'react'

import { render } from '@testing-library/react'

import { RealtimeProvider } from '@gorgias/realtime'

import { reportError } from 'utils/errors'

import RealtimeAppProvider from '../RealtimeAppProvider'

const MockRealtimeProvider = jest
    .fn()
    .mockImplementation(
        ({ children }: ComponentProps<typeof RealtimeProvider>) => (
            <div>
                <p>RealtimeProvider</p>
                {children}
            </div>
        ),
    )

jest.mock('@gorgias/realtime', () => ({
    ...jest.requireActual('@gorgias/realtime'),
    RealtimeProvider: (props: ComponentProps<typeof RealtimeProvider>) => (
        <MockRealtimeProvider {...props} />
    ),
}))

jest.mock('core/flags', () => ({
    useFlag: jest.fn().mockReturnValue(true),
}))

jest.mock('utils/errors')
const mockReportError = reportError as jest.Mock

describe('RealtimeAppProvider', () => {
    it('should render', () => {
        const { getByText } = render(
            <RealtimeAppProvider>foo</RealtimeAppProvider>,
        )

        expect(getByText('RealtimeProvider')).toBeInTheDocument()
    })

    it.each([
        ['acme', true],
        ['artemisathletix', true],
        ['yakovishen', true],
        ['walter-test', true],
        ['other', false],
    ])(`should set PNWorkerLogVerbosity to %s`, (domain, expected) => {
        window.GORGIAS_STATE.currentAccount.domain = domain

        render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        expect(MockRealtimeProvider).toHaveBeenCalledWith(
            expect.objectContaining({
                subscriptionWorkerLogVerbosity: expected,
            }),
            {},
        )
    })

    it('should call reportError when there is an error', () => {
        const pnError = new Error(`PubNub Status error`)
        render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        MockRealtimeProvider.mock.calls[0][0].onErrorStatus({
            statusCode: '400',
            operation: 'foo',
        })

        expect(mockReportError).toHaveBeenCalledWith(pnError, {
            tags: {
                operation: 'foo',
                statusCode: '400',
            },
            extra: {
                status: { statusCode: '400', operation: 'foo' },
            },
        })
    })
})
