import {Connection} from 'twilio-client'

import {
    mockIncomingConnection,
    mockOutgoingConnection,
} from '../../../../../tests/twilioMocks'
import {useConnectionParameters} from '../hooks'

describe('useConnectionParameters()', () => {
    it('should return parameters for an incoming connection', () => {
        const connection = mockIncomingConnection() as Connection
        const parameters = useConnectionParameters(connection)

        expect(parameters).toMatchSnapshot()
    })

    it('should return parameters for an outgoing connection', () => {
        const connection = mockOutgoingConnection() as Connection
        const parameters = useConnectionParameters(connection)

        expect(parameters).toMatchSnapshot()
    })
})
