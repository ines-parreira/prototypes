import { useMutation } from '@tanstack/react-query'

import { CONVERT_DEFAULT_OPTIONS } from 'models/convert/constants'
import { useConvertApi } from 'pages/convert/common/hooks/useConvertApi'
import { MutationOverrides } from 'types/query'

import {
    createABGroup,
    pauseABGroup,
    startABGroup,
    stopABGroup,
} from './resources'

export const useCreateABGroup = (
    overrides?: MutationOverrides<typeof createABGroup>,
) => {
    const { client: convertClient } = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, pathParams]) =>
            createABGroup(client, pathParams),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}

export const useStartABGroup = (
    overrides?: MutationOverrides<typeof startABGroup>,
) => {
    const { client: convertClient } = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, pathParams]) =>
            startABGroup(client, pathParams),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}

export const usePauseABGroup = (
    overrides?: MutationOverrides<typeof pauseABGroup>,
) => {
    const { client: convertClient } = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, pathParams]) =>
            pauseABGroup(client, pathParams),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}

export const useStopABGroup = (
    overrides?: MutationOverrides<typeof stopABGroup>,
) => {
    const { client: convertClient } = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, pathParams, data]) =>
            stopABGroup(client, pathParams, data),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}
