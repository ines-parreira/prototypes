import React from 'react'

import {UserSettingType} from 'config/types/user'
import {ViewType} from 'models/view/types'
import ViewNavbarView from 'pages/common/components/ViewNavbarView/ViewNavbarView'

type Props = {
    settingType: UserSettingType
    isLoading: boolean
}

const CustomersNavbarView = (props: Props) => (
    <ViewNavbarView viewType={ViewType.CustomerList} {...props} />
)

export default CustomersNavbarView
