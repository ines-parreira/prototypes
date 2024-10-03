import {useMemo} from 'react'
import _orderBy from 'lodash/orderBy'

import {ActionTemplateApp} from 'pages/automate/actionsPlatform/types'

import {TemplateConfiguration} from '../types'

const WEIGHT_BY_NATIVE_APP_TYPE: Record<
    Exclude<ActionTemplateApp['type'], 'app'>,
    string
> = {
    shopify: '0',
    recharge: '00',
}

const useSortedActionTemplates = (templates: TemplateConfiguration[]) => {
    return useMemo(() => {
        return _orderBy(
            templates,
            [
                (template) => {
                    const app = template.apps[0]

                    return app.type === 'app'
                        ? app.app_id
                        : WEIGHT_BY_NATIVE_APP_TYPE[app.type]
                },
                'name',
            ],
            ['asc', 'asc']
        )
    }, [templates])
}

export default useSortedActionTemplates
