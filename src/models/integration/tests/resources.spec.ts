import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'
import {fetchApps} from '../resources'

const mockedServer = new MockAdapter(client)

const mockedApp = {
    app_icon: 'https://ok.com/1.png',
    app_url: 'https://ok.com',
    headline: 'Some tagline here',
    id: 'someif',
    name: 'My test app',
}

mockedServer.onGet('/api/apps/').reply(200, {data: [mockedApp]})

describe('integration resource', () => {
    describe('fetchApps', () => {
        it('should return formatted apps', async () => {
            const res = await fetchApps()
            expect(res).toStrictEqual([
                {
                    count: 0,
                    description: 'Some tagline here',
                    image: 'https://ok.com/1.png',
                    title: 'My test app',
                    type: 'app',
                    url: 'https://ok.com',
                },
            ])
        })
    })
})
