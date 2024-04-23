import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {HelpCenter} from 'models/helpCenter/types'

const FIVE_MINUTES = 1000 * 60 * 5

export const useGuidanceHelpCenter = ({
    shopName,
}: {
    shopName: string
}): HelpCenter | undefined => {
    // We expect to handle only 1 guidance help center
    const {data} = useGetHelpCenterList(
        {type: 'guidance', per_page: 1, shop_name: shopName},
        {
            // Guidance Help Center is not expected to change frequently
            staleTime: FIVE_MINUTES,
        }
    )
    const guidanceHelpCenter = data?.data.data[0]

    return guidanceHelpCenter
}
