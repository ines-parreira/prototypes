import {Label} from '@gorgias/merchant-ui-kit'
import {produce} from 'immer'
import React, {useCallback, useRef, useState} from 'react'

import {IntegrationType} from 'models/integration/constants'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import useGetAppFromTemplateApp from '../hooks/useGetAppFromTemplateApp'
import {ActionTemplateApp, App} from '../types'

import css from './ActionsPlatformAppSelectBox.less'

type Props = {
    apps: App[]
    value: ActionTemplateApp[]
    onChange: (value: ActionTemplateApp[]) => void
    isDisabled?: boolean
}

const ActionsPlatformTemplateAppsSelectBox = ({
    apps,
    value,
    onChange,
    isDisabled,
}: Props) => {
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const [isOpen, setIsOpen] = useState(false)

    const getAppFromTemplateApp = useGetAppFromTemplateApp({apps})

    const appsValue = value
        .map(getAppFromTemplateApp)
        .filter((app): app is App => !!app)

    const handleClick = useCallback(
        (app: App) => {
            switch (app.type) {
                case IntegrationType.App:
                    {
                        const nextValue = produce(value, (draft) => {
                            const index = draft.findIndex(
                                (item) =>
                                    item.type === 'app' &&
                                    item.app_id === app.id
                            )

                            if (index !== -1) {
                                draft.splice(index, 1)
                            } else {
                                draft.unshift({
                                    app_id: app.id,
                                    type: app.type,
                                })
                            }
                        })

                        onChange(nextValue)
                    }
                    break
                case 'shopify': {
                    const nextValue = produce(value, (draft) => {
                        const index = draft.findIndex(
                            (item) => item.type === 'shopify'
                        )

                        if (index !== -1) {
                            draft.splice(index, 1)
                        } else {
                            draft.push({type: 'shopify'})
                        }
                    })

                    onChange(nextValue)

                    break
                }
                default: {
                    const type = app.type
                    const nextValue = produce(value, (draft) => {
                        const index = draft.findIndex(
                            (item) => item.type === type
                        )

                        if (index !== -1) {
                            draft.splice(index, 1)
                        } else {
                            draft.unshift({type})
                        }
                    })

                    onChange(nextValue)
                }
            }
        },
        [value, onChange]
    )

    return (
        <div className={css.container}>
            <Label isRequired>App(s)</Label>
            <SelectInputBox
                placeholder="Select App(s)"
                floating={floatingRef}
                ref={targetRef}
                onToggle={setIsOpen}
                label={appsValue.map((app) => app.name)}
                isDisabled={isDisabled}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={appsValue.map((app) => app.id)}
                            isMultiple
                        >
                            <DropdownSearch autoFocus />
                            <DropdownBody>
                                {apps.map((app) => (
                                    <DropdownItem
                                        key={app.id}
                                        option={{
                                            value: app.id,
                                            label: app.name,
                                        }}
                                        onClick={() => {
                                            handleClick(app)
                                        }}
                                        isDisabled={
                                            value.some(
                                                (item) =>
                                                    item.type !== 'shopify' &&
                                                    (item.type === 'app'
                                                        ? item.app_id !== app.id
                                                        : item.type !==
                                                          app.type)
                                            ) && app.type !== 'shopify'
                                        }
                                    >
                                        <img
                                            src={app.icon}
                                            alt={app.name}
                                            className={css.icon}
                                            title={app.name}
                                        />
                                        <span className={css.name}>
                                            {app.name}
                                        </span>
                                    </DropdownItem>
                                ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        </div>
    )
}

export default ActionsPlatformTemplateAppsSelectBox
