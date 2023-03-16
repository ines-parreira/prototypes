import {RateLimitedAxiosInstance} from 'axios-rate-limit'
import helpdeskClient from 'models/api/resources'
import {CubeQueryBody, CubeResponse} from 'pages/stats/revenue/clients/types'

export class Client {
    constructor(private readonly client: RateLimitedAxiosInstance) {
        this.client = client
    }

    // simulates Cube package interface to remain swappable in the future
    load = async (query: CubeQueryBody): Promise<CubeResponse> => {
        const response = await this.client.get('/api/analytics/', {
            params: {query: JSON.stringify([query])},
        })

        return response.data as CubeResponse
    }
}

const client = new Client(helpdeskClient)

export default client
