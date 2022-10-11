import React, {useCallback} from 'react'

import classNames from 'classnames'

import {
    UncontrolledTooltip,
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'

import {List, Map} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    MacroActionName,
    MacroResponseActionName,
} from 'models/macroAction/types'

import css from './MacroMessageActionsHeader.less'

type MessageOptionConfig = {
    title: string
    icon: string
    featureFlagKey?: FeatureFlagKey
}

const optionsConfig: Record<MacroResponseActionName, MessageOptionConfig> = {
    [MacroActionName.SetResponseText]: {
        title: 'Response text',
        icon: 'reply',
    },
    [MacroActionName.ForwardByEmail]: {
        title: 'Forward by email',
        icon: 'forward',
        featureFlagKey: FeatureFlagKey.MacroForwardByEmail,
    },
    [MacroActionName.AddInternalNote]: {
        title: 'Internal note',
        icon: 'note',
    },
}

type MacroMessageActionsHeaderDropdownItemProps = {
    type: MacroResponseActionName
    current: boolean
    used: boolean
    onSelect: (type: MacroResponseActionName) => void
}

const MacroMessageActionsHeaderDropdownItem: React.FC<MacroMessageActionsHeaderDropdownItemProps> =
    ({type, current, used, onSelect}) => {
        const id = `macro-action-header-item-${type}`
        const disabled = !current && used
        const onClick = useCallback(() => onSelect(type), [onSelect, type])
        const flags = useFlags()

        const {title, icon, featureFlagKey} = optionsConfig[type]

        if (featureFlagKey && !flags[featureFlagKey]) {
            return null
        }

        return (
            <>
                <DropdownItem
                    type="button"
                    className={classNames(css.dropdownItem, {
                        [css.dropdownItemDisabled]: disabled,
                    })}
                    onClick={current || disabled ? undefined : onClick}
                    toggle={!disabled}
                    id={id}
                >
                    <i className="material-icons">{icon}</i>
                    <span>{title}</span>
                    {(current || used) && (
                        <i className="material-icons">check</i>
                    )}
                </DropdownItem>
                {disabled && (
                    <UncontrolledTooltip target={id}>
                        There’s already
                        {type === MacroActionName.AddInternalNote
                            ? ' an '
                            : ' '}
                        {title.toLowerCase()} added to this macro.
                    </UncontrolledTooltip>
                )}
            </>
        )
    }

const MacroMessageActionsHeaderDropdown: typeof MacroMessageActionsHeader = ({
    actions,
    type,
    onSelect,
}) => (
    <UncontrolledButtonDropdown className={css.dropdown}>
        <DropdownToggle caret color="" className={css.dropdownToggle}>
            <i className="material-icons">{optionsConfig[type].icon}</i>
        </DropdownToggle>
        <DropdownMenu className={css.dropdownMenu}>
            <div className={css.menu}>
                {Object.keys(optionsConfig).map((key) => (
                    <MacroMessageActionsHeaderDropdownItem
                        key={key}
                        type={key as MacroResponseActionName}
                        used={actions.some(
                            (action: Map<any, any>) =>
                                action.get('name') === key
                        )}
                        current={type === key}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </DropdownMenu>
    </UncontrolledButtonDropdown>
)

export type MacroMessageActionsHeaderProps = {
    actions: List<any>
    type: MacroResponseActionName
    onSelect: (type: MacroResponseActionName) => void
}

const MacroMessageActionsHeader: React.FC<MacroMessageActionsHeaderProps> = ({
    actions,
    type,
    onSelect,
    children,
}) => (
    <div className={css.wrapper}>
        <MacroMessageActionsHeaderDropdown
            actions={actions}
            type={type}
            onSelect={onSelect}
        />
        <div className={css.content}>{children}</div>
    </div>
)
export default MacroMessageActionsHeader
