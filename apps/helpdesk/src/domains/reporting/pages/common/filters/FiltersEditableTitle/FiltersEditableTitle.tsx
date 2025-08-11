import React, { useMemo } from 'react'

import classNames from 'classnames'

import { Badge } from '@gorgias/axiom'

import { FilterWarningIcon } from 'domains/reporting/pages/common/components/Filter/components/FilterWarning/FilterWarningIcon'
import css from 'domains/reporting/pages/common/filters/FiltersEditableTitle/FiltersEditableTitle.less'
import useAppSelector from 'hooks/useAppSelector'
import InputField from 'pages/common/forms/input/InputField'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

type Props = {
    isEditMode: boolean
    toggleIsEditMode: (value: boolean) => void
    error?: string
    title: string
    errorType?: 'not-applicable' | 'non-existent'
    onChange: (value: string) => void
    errorMessage?: string
    isPinned?: boolean
}

const PLACEHOLDER = 'Name Filter'
export const DEFAULT_BADGE_TEXT = 'Default'
export const NOT_APPLICABLE_ERROR =
    'Some filters are not applicable to this report and are disabled.'
export const NOT_EXISTENT_AGENT_ERROR =
    'Some filters or values have been archived or deleted. They will be ignored. Contact your admin to update settings.'
export const NOT_EXISTENT_ADMIN_ERROR =
    'Some filters or values have been archived or deleted. They will be ignored. Check your settings and update your Saved Filters.'

export const getTooltipContent = (
    canEdit: boolean,
    errorType?: 'not-applicable' | 'non-existent',
): string => {
    if (errorType === 'non-existent') {
        if (canEdit) {
            return NOT_EXISTENT_ADMIN_ERROR
        }
        return NOT_EXISTENT_AGENT_ERROR
    }
    return NOT_APPLICABLE_ERROR
}

const getPrefixIcon = (value: string) => (
    <i
        className={classNames(
            'material-icons',
            css.icon,
            !value.trim().length && css.disableTuneIcon,
        )}
    >
        tune
    </i>
)

export const FiltersEditableTitle = ({
    error,
    title,
    isEditMode,
    toggleIsEditMode,
    errorType,
    errorMessage,
    onChange,
    isPinned,
}: Props) => {
    const currentUser = useAppSelector(getCurrentUser)

    const prefix = getPrefixIcon(title)
    const isCurrentUserTeamLead = isTeamLead(currentUser)

    const tooltipContent = useMemo(
        () => getTooltipContent(isCurrentUserTeamLead, errorType),
        [errorType, isCurrentUserTeamLead],
    )

    return isEditMode ? (
        <InputField
            inputClassName={classNames(css.title, css.editMode)}
            value={title}
            onChange={onChange}
            placeholder={PLACEHOLDER}
            prefix={prefix}
            error={error}
        />
    ) : (
        <div
            className={classNames(css.wrapper)}
            onClick={() => toggleIsEditMode(true)}
        >
            {prefix}
            <span className={css.title}>
                {title}
                {errorType && (
                    <FilterWarningIcon
                        tooltip={errorMessage || tooltipContent}
                        warningType={errorType}
                        tooltipPlacement="right"
                    />
                )}
                {isPinned && (
                    <Badge type="light-grey" upperCase className={css.badge}>
                        {DEFAULT_BADGE_TEXT}
                    </Badge>
                )}
            </span>
        </div>
    )
}
