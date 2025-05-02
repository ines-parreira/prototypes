import { FeatureFlagKey } from 'config/featureFlags'
import { UserSettingType } from 'config/types/user'
import { useFlag } from 'core/flags'
import { ViewType } from 'models/view/types'
import ViewNavbarView from 'pages/common/components/ViewNavbarView/ViewNavbarView'

import { CustomersNavbarViewV2 } from './CustomersNavbarViewV2'

type Props = {
    settingType: UserSettingType
    isLoading: boolean
}

const CustomersNavbarView = (props: Props) => {
    const showCustomersNavbarV2 = useFlag(FeatureFlagKey.RevampNavBarUi)

    return showCustomersNavbarV2 ? (
        <CustomersNavbarViewV2 viewType={ViewType.CustomerList} {...props} />
    ) : (
        <ViewNavbarView viewType={ViewType.CustomerList} {...props} />
    )
}

export default CustomersNavbarView
