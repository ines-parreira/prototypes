import useAppSelector from 'hooks/useAppSelector'
import {TableColumnsOrder} from 'pages/stats/AgentsTableConfig'
import {getAgentsTableConfigSettingsJS} from 'state/currentAccount/selectors'
import {TableColumn} from 'state/ui/stats/types'

export const useAgentsTableConfigSetting = (): TableColumn[] => {
    const settings = useAppSelector(getAgentsTableConfigSettingsJS)

    return settings ? settings.data : TableColumnsOrder
}
