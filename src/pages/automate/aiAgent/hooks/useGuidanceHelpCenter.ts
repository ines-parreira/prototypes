import useAppSelector from 'hooks/useAppSelector'
import {HelpCenter} from 'models/helpCenter/types'
import {getHelpCenterGuidanceList} from 'state/entities/helpCenter/helpCenters'

export const useGuidanceHelpCenter = (): HelpCenter | undefined => {
    const helpCenterGuidanceList = useAppSelector(getHelpCenterGuidanceList)
    const guidanceHelpCenter = helpCenterGuidanceList[0] // Assuming there is only one guidance help center

    return guidanceHelpCenter
}
