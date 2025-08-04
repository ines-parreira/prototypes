import defaultConfig from '@repo/jest-config'
import type { Config } from 'jest'

const config: Config = {
    ...defaultConfig,
    setupFilesAfterEnv: ['./tests/setup.ts'],
}

export default config
