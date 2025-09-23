import { type Config, defaultConfig } from '@repo/config/jest'

const config: Config = {
    ...defaultConfig,
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/tests/__mocks__/fileMock.ts',
        '\\.(css|less)$': 'identity-obj-proxy',
    },
    setupFilesAfterEnv: ['./setup-tests.ts'],
}

export default config
