import { type Config, defaultConfig } from '@repo/config/jest'

const config: Config = {
    ...defaultConfig,
    setupFilesAfterEnv: ['./tests/setup.ts'],
}

export default config
