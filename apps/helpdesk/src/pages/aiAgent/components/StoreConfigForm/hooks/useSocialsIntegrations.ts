import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { getFacebookIntegrations } from 'state/integrations/selectors'

import type { SocialsIntegration } from '../types'

export function useSocialsIntegrations(): SocialsIntegration[] {
    const facebookIntegrations = useAppSelector(getFacebookIntegrations)

    return useMemo(() => {
        let plain: unknown[]
        const source = facebookIntegrations as any
        if (Array.isArray(source)) {
            plain = source
        } else if (typeof source?.toJS === 'function') {
            plain = source.toJS() as unknown[]
        } else if (typeof source?.toArray === 'function') {
            plain = source.toArray() as unknown[]
        } else {
            plain = []
        }

        return plain
            .filter((integration: any) => integration?.meta?.instagram)
            .map(
                (integration: any): SocialsIntegration => ({
                    id: integration.id as number,
                    pageName:
                        (integration.meta?.name as string | undefined) ?? '',
                    instagramUsername:
                        (integration.meta?.instagram?.username as
                            | string
                            | undefined) ?? '',
                }),
            )
    }, [facebookIntegrations])
}
