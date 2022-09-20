import React, {useState} from 'react'

import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'
import classnames from 'classnames'
import _upperFirst from 'lodash/upperFirst'

import Button from 'pages/common/components/button/Button'
import {objKeys} from 'utils'
import {VisibilityStatus} from 'models/helpCenter/types'

import css from './SelectVisibilityStatus.less'

export type SelectVisibilityStatusProps = {
    status?: VisibilityStatus
    onChange: (status: VisibilityStatus) => void
    isParentUnlisted: boolean
    showNotification: boolean
    setShowNotification: (showNotification: boolean) => void
    type: 'article' | 'category'
    className?: string
    isDisabled?: boolean
}

const SelectVisibilityStatus = ({
    status = 'PUBLIC',
    onChange,
    className,
    isParentUnlisted,
    showNotification,
    setShowNotification,
    type,
    isDisabled = false,
}: SelectVisibilityStatusProps) => {
    const [isToggleOpen, setIsToggleOpen] = useState(false)

    const optionsVisibilityStatus: Record<
        VisibilityStatus,
        {
            title: string
            icon: string
            description: string
            descriptionInheritUnlisted?: string
        }
    > = {
        UNLISTED: {
            title: 'Unlisted',
            description: `${_upperFirst(
                type
            )} is accessible only via direct link and is not indexed by search engines.`,
            icon: 'visibility_off',
        },
        PUBLIC: {
            title: 'Public',
            description: `${_upperFirst(
                type
            )} is public to everyone visiting your helpcenter.`,
            descriptionInheritUnlisted: `${_upperFirst(
                type
            )} is currently only accessible via direct link because one of its parent categories is unlisted.`,
            icon: 'visibility',
        },
    }

    return (
        <div className={classnames(className, css.wrapper)}>
            <UncontrolledDropdown
                toggle={() => setIsToggleOpen(!isToggleOpen)}
                isOpen={isToggleOpen}
                disabled={isDisabled}
            >
                <DropdownToggle tag="div" data-toggle="dropdown">
                    <div className={classnames(css.select, 'dropdown-toggle')}>
                        <div className={css.status}>
                            <i
                                className={classnames(
                                    css.icon,
                                    'material-icons'
                                )}
                            >
                                {optionsVisibilityStatus[status].icon}
                            </i>
                            <div>
                                {optionsVisibilityStatus[status].title}
                                {isParentUnlisted &&
                                    status === 'PUBLIC' &&
                                    ' (currently Unlisted)'}
                            </div>
                        </div>
                        <i
                            className={classnames(
                                'material-icons',
                                css.dropdownIcon
                            )}
                        >
                            arrow_drop_down
                        </i>
                    </div>
                </DropdownToggle>
                <DropdownMenu className={css.dropdown}>
                    {objKeys(optionsVisibilityStatus).map((key) => {
                        const isPublicButUnlisted =
                            isParentUnlisted && key === 'PUBLIC'

                        const title = isPublicButUnlisted
                            ? `${optionsVisibilityStatus[key].title} (currently Unlisted)`
                            : optionsVisibilityStatus[key].title
                        const description = isPublicButUnlisted
                            ? optionsVisibilityStatus[key]
                                  .descriptionInheritUnlisted
                            : optionsVisibilityStatus[key].description

                        return (
                            <DropdownItem
                                key={key}
                                className={css.option}
                                onClick={() => onChange(key)}
                                tag="div"
                            >
                                <i
                                    className={classnames(
                                        css.icon,
                                        'material-icons'
                                    )}
                                >
                                    {optionsVisibilityStatus[key].icon}
                                </i>
                                <div className={css.details}>
                                    <div className={css.title}>{title}</div>
                                    <div className={css.description}>
                                        {description}
                                    </div>
                                </div>
                            </DropdownItem>
                        )
                    })}
                </DropdownMenu>
            </UncontrolledDropdown>
            {showNotification && status === 'PUBLIC' && (
                <div className={css.notificationWrapper}>
                    <div>
                        This {type}{' '}
                        {type === 'category' && 'and all its content'} will only
                        be accessible via direct link because one of its parent
                        categories is unlisted.
                    </div>
                    <Button
                        type="button"
                        intent="secondary"
                        size="small"
                        onClick={() => setShowNotification(false)}
                        className={css.gotItButton}
                    >
                        Got it
                    </Button>
                </div>
            )}
        </div>
    )
}

export default SelectVisibilityStatus
