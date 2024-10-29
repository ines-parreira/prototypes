import classNames from 'classnames'
import React, {useMemo, useState} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import InputField from 'pages/common/forms/input/InputField'
import {FilterWarningIcon} from 'pages/stats/common/components/Filter/components/FilterWarning/FilterWarningIcon'
import css from 'pages/stats/common/filters/FiltersEditableTitle/FiltersEditableTitle.less'
import {getCurrentUser} from 'state/currentUser/selectors'
import {isAdmin} from 'utils'

type Props = {
    isEditMode: boolean
    toggleIsEditMode: (value: boolean) => void
    error?: string
    title: string
    errorType?: 'not-applicable' | 'non-existent'
}

const PLACEHOLDER = 'Name Filter'
export const NOT_APPLICABLE_ERROR =
    'Some filters are not applicable to this report and are disabled.'
export const NOT_EXISTENT_AGENT_ERROR =
    'Some filters or values have been archived or deleted. They will be ignored. Contact your admin to update settings.'
export const NOT_EXISTENT_ADMIN_ERROR =
    'Some filters or values have been archived or deleted. They will be ignored. Check your settings and update your Saved Filters.'

export const getTooltipContent = (
    isAdmin: boolean,
    errorType?: 'not-applicable' | 'non-existent'
): string => {
    if (errorType === 'non-existent') {
        if (isAdmin) {
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
            !value.trim().length && css.disableTuneIcon
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
}: Props) => {
    const [value, setValue] = useState(title)

    const currentUser = useAppSelector(getCurrentUser)

    const prefix = getPrefixIcon(value)
    const isCurrentUserAdmin = isAdmin(currentUser)

    const tooltipContent = useMemo(
        () => getTooltipContent(isCurrentUserAdmin, errorType),
        [errorType, isCurrentUserAdmin]
    )

    return isEditMode ? (
        <InputField
            inputClassName={classNames(css.title, css.editMode)}
            value={value}
            onChange={(newValue) => setValue(newValue)}
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
            <span className={css.title}>{value}</span>
            {errorType && (
                <FilterWarningIcon
                    tooltip={tooltipContent}
                    warningType={errorType}
                    tooltipPlacement="right"
                />
            )}
        </div>
    )
}
