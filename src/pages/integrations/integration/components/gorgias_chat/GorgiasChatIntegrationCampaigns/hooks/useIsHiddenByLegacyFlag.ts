// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useLocalStorage} from 'react-use'
import {useMemo} from 'react'
import moment from 'moment'
import {CAMPAIGN_INFO_BOX_STORAGE_KEY} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/components/CampaignGenerator/constants'

export const CUTOFF_DATETIME = moment('2023-08-15T00:00:00.000Z')

/*
 *  We had a bug where the `CAMPAIGN_INFO_BOX_STORAGE_KEY` decided about
 * the visibility of the infobox for all integrations. We introduced a fix
 * to display it per integration, but we need to keep the infobox hidden
 * for already dismissed infoboxes, that's why we'll compare
 * the integration created time with the time of the bugfix being shipped.
 */
export function useIsHiddenByLegacyFlag(
    integration: Immutable.Map<any, any>
): boolean {
    const [isHiddenLegacy] = useLocalStorage<boolean>(
        CAMPAIGN_INFO_BOX_STORAGE_KEY
    )

    const isHidden = useMemo(() => {
        const integrationCreatedDate = moment(
            integration?.get('created_datetime')
        )
        return (
            isHiddenLegacy && integrationCreatedDate.isBefore(CUTOFF_DATETIME)
        )
    }, [isHiddenLegacy, integration])

    return isHidden || false
}
