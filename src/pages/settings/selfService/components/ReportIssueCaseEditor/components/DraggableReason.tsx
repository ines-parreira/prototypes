import React, {ReactElement, useMemo} from 'react'
import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {Link, useRouteMatch} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {ReportIssueCaseReason} from 'models/selfServiceConfiguration/types'

import {
    useReorderDnD,
    Callbacks,
} from '../../../../helpCenter/hooks/useReorderDnD'

import {SELECTABLE_REASONS_DROPDOWN_OPTIONS} from '../constants'
import css from './DraggableReason.less'

interface ReportIssueCaseProps {
    reason: ReportIssueCaseReason
    position: number
    onMoveEntity: Callbacks['onHover']
    onDeleteEntity: () => void
    allowEdit: boolean
}

const Reason = ({
    reason: {action, reasonKey},
    position,
    onMoveEntity,
    onDeleteEntity,
    allowEdit,
}: ReportIssueCaseProps): ReactElement => {
    const {
        params: {shopName, integrationType, caseIndex},
    } = useRouteMatch<{
        shopName: string
        integrationType: string
        caseIndex: string
    }>()

    const hasAutomatedResponseOrderManagementFlag =
        useFlags()[FeatureFlagKey.SelfServiceAutomatedResponseOrderManagement]

    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {
            position,
            id: reasonKey,
            type: `reason`,
        },
        [`reason`],
        {onHover: onMoveEntity}
    )

    const reasonLabel = useMemo(
        () =>
            SELECTABLE_REASONS_DROPDOWN_OPTIONS.find(
                (opt) => opt.value === reasonKey
            )?.label,
        [reasonKey]
    )

    const noAutomatedResponse = !action?.responseMessageContent.text

    return (
        <li
            className={css.reasonRow}
            key={reasonKey}
            ref={dropRef as React.RefObject<HTMLLIElement>}
            data-handler-id={handlerId}
            style={{opacity: isDragging ? 0 : 1}}
        >
            <div
                ref={dragRef as React.RefObject<HTMLDivElement>}
                className={classNames(css.dragIcon, 'material-icons')}
            >
                drag_indicator
            </div>

            <div className={classNames(css.reasonText, 'link-full-td')}>
                {reasonLabel}
            </div>

            {hasAutomatedResponseOrderManagementFlag && allowEdit ? (
                <>
                    {noAutomatedResponse && (
                        <div className={css.noResponseWarning}>
                            <i className="material-icons">error</i> No response
                            configured
                        </div>
                    )}

                    <div className={css.editResponse}>
                        <Link
                            to={`/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue/${caseIndex}/reasons/${position}`}
                        >
                            Edit Response
                            <span className="material-icons chevron_right">
                                chevron_right
                            </span>
                        </Link>
                    </div>
                </>
            ) : (
                <button
                    type="button"
                    className={css.deleteButton}
                    onClick={onDeleteEntity}
                >
                    <span className="icon material-icons">clear</span>
                </button>
            )}
        </li>
    )
}

export default Reason
