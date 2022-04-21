import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import {fetchEmailDomains} from '../resources'

describe('email resources', () => {
    const mockedServer = new MockAdapter(axios)

    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetch email domains', () => {
        it('should resolve with data', async () => {
            mockedServer.onGet('/api/integrations/domains').reply(200, {
                data: [
                    {
                        name: 'gorgias-test.com',
                        verified: true,
                    },
                ],
            })
            const res = await fetchEmailDomains()
            expect(res).toMatchSnapshot()
        })
    })
})
