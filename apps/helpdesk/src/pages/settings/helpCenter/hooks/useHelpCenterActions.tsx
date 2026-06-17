import { useCallback } from 'react'

import { reportError } from '@repo/logging'

import { toast } from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { helpCenterUpdated } from 'state/entities/helpCenter/helpCenters/actions'

import { useCurrentHelpCenter } from '../hooks/useCurrentHelpCenter'
import { useHelpCenterApi } from './useHelpCenterApi'

export const useHelpCenterActions = () => {
    const dispatch = useAppDispatch()
    const { client } = useHelpCenterApi()
    const helpCenter = useCurrentHelpCenter()

    const fetchHelpCenterTranslations = useCallback(async () => {
        if (client && helpCenter) {
            try {
                const { data } = await client.getHelpCenter({
                    help_center_id: helpCenter.id,
                    fields: ['translations'],
                })

                dispatch(helpCenterUpdated(data))
            } catch (err) {
                toast.error("Failed to fetch Help Center's translations")
                reportError(err as Error)
            }
        }
    }, [client, helpCenter, dispatch])

    const getHelpCenterCustomDomain = useCallback(async () => {
        if (client && helpCenter) {
            try {
                const {
                    data: { data: customDomains },
                } = await client.listCustomDomains({
                    help_center_id: helpCenter.id,
                })

                const activeCustomDomain = customDomains.find(
                    (domain) => domain.status === 'active',
                )
                const customDomain = activeCustomDomain ?? customDomains[0]

                dispatch(helpCenterUpdated({ ...helpCenter, customDomain }))
            } catch (err) {
                toast.error("Failed to fetch Help Center's custom domains")

                reportError(err as Error)
            }
        }
    }, [client, helpCenter, dispatch])

    return { fetchHelpCenterTranslations, getHelpCenterCustomDomain }
}
