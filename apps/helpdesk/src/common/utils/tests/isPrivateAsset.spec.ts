import { getEnvironment, GorgiasUIEnv } from 'utils/environment'

import isPrivateAsset from '../isPrivateAsset'

jest.mock('utils/environment', () => {
    const actual = jest.requireActual('utils/environment')

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { ...actual, getEnvironment: jest.fn() }
})

const getEnvironmentMock = getEnvironment as jest.Mock

describe('isPrivateAsset', () => {
    it.each([
        [
            GorgiasUIEnv.Development,
            'https://uploads.gorgi.us/my-amazing-asset.png',
        ],
        [
            GorgiasUIEnv.Staging,
            'https://uploads.gorgias.xyz/my-amazing-asset.png',
        ],
        [
            GorgiasUIEnv.Production,
            'https://uploads.gorgias.io/my-amazing-asset.png',
        ],
    ])('should return true for private assets', (env, url) => {
        getEnvironmentMock.mockReturnValue(env)
        expect(isPrivateAsset(url)).toBe(true)
    })

    it.each([
        [
            GorgiasUIEnv.Development,
            'https://public-uploads.gorgi.us/my-amazing-asset.png',
        ],
        [
            GorgiasUIEnv.Staging,
            'https://public-uploads.gorgias.xyz/my-amazing-asset.png',
        ],
        [
            GorgiasUIEnv.Production,
            'https://public-uploads.gorgias.io/my-amazing-asset.png',
        ],
    ])('should return false for public assets', (env, url) => {
        getEnvironmentMock.mockReturnValue(env)
        expect(isPrivateAsset(url)).toBe(false)
    })
})
