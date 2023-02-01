import classNames from 'classnames'
import React from 'react'
import {useRouteMatch} from 'react-router'

import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {getIntegrations} from 'state/integrations/selectors'
import {SelectableOption} from 'pages/common/forms/SelectField/types'
import useAppSelector from 'hooks/useAppSelector'
import {useChatIntegration} from '../../QuickResponseFlowsPreferences/components/SelfServicePreview/hooks'

import css from './ReportIssuePreviewAllOptions.less'

type Props = {
    reasonOptions: SelectableOption[]
}

const ReportIssuePreviewAllOptions = ({reasonOptions}: Props) => {
    const integrations = useAppSelector(getIntegrations)

    const {
        params: {shopName},
    } = useRouteMatch<{
        shopName: string
    }>()

    const {chatIntegration} = useChatIntegration({integrations, shopName})

    const sspTexts =
        GORGIAS_CHAT_SSP_TEXTS[chatIntegration?.meta?.language || 'en-US']

    if (!chatIntegration) {
        return null
    }

    return (
        <>
            <span className={css.header}>{sspTexts.whatIsWrongWithOrder}</span>
            <ul className={css.list}>
                {reasonOptions.map((reason) => (
                    <li className={css.listItem} key={reason.value}>
                        <span>{sspTexts[reason.value] ?? reason.label}</span>

                        <span
                            className={classNames(
                                'material-icons-outlined',
                                css.chevronIcon
                            )}
                        >
                            chevron_right
                        </span>
                    </li>
                ))}
            </ul>
        </>
    )
}

export default ReportIssuePreviewAllOptions
