import { getLDClient } from 'utils/launchDarkly'

import { getMigrationMode } from '../utils'

jest.mock('utils/launchDarkly')
const variationMock = getLDClient().variation as jest.Mock
;(getLDClient().waitForInitialization as jest.Mock).mockResolvedValue({})

describe('getMigrationMode', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return migration mode from LaunchDarkly', async () => {
        variationMock.mockReturnValue('live')

        const result = await getMigrationMode('test-flag')

        expect(getLDClient().waitForInitialization).toHaveBeenCalledWith(3)
        expect(variationMock).toHaveBeenCalledWith('test-flag', 'off')
        expect(result).toBe('live')
    })

    it('should return default value when flag is not set', async () => {
        variationMock.mockReturnValue('off')

        const result = await getMigrationMode('unset-flag')

        expect(result).toBe('off')
    })
})
