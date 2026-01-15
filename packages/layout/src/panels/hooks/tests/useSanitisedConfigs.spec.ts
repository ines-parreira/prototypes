import { renderHook } from '@testing-library/react'

import { useSanitisedConfigs } from '../useSanitisedConfigs'

describe('useSanitisedConfigs', () => {
    it('return sanitised versions of the configs', () => {
        const configs = {
            panel1: { defaultSize: 0.3, minSize: 0.2, maxSize: 0.5 },
        }
        const { result } = renderHook(() => useSanitisedConfigs(configs, 1000))
        expect(result.current).toEqual({
            panel1: { defaultSize: 300, minSize: 200, maxSize: 500 },
        })
    })
})
