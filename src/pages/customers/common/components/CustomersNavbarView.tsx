import React from 'react'

import ViewNavbarView from 'pages/common/components/ViewNavbarView/ViewNavbarView'
import {ViewType} from 'models/view/types'
import {UserSettingType} from 'config/types/user'

type Props = {
    settingType: UserSettingType
    isLoading: boolean
}

const CustomersNavbarView = (props: Props) => (
    <ViewNavbarView viewType={ViewType.CustomerList} {...props} />
)

export default CustomersNavbarView
