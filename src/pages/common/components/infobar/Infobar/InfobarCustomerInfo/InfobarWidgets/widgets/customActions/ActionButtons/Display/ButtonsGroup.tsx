import React, {ComponentProps, memo, useRef} from 'react'
import {UncontrolledDropdown, DropdownMenu, DropdownToggle} from 'reactstrap'
import classnames from 'classnames'

import {useTemplateContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/hooks/useTemplateContext'
import {Source} from 'models/widget/types'
import {ContentType} from 'models/api/types'
import Group from 'pages/common/components/layout/Group'
import IconButton from 'pages/common/components/button/IconButton'
import {
    Action,
    Button as ButtonType,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import css from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/ActionButtons.less'
import {useComputeNbButtonDisplayed} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/hooks/useComputeNbButtonDisplayed'
import {
    applyCustomActionTemplate,
    applyCustomActionVariables,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/helpers/templating'
import {mapTemplateParameters} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/helpers/mapTemplateParameters'

import Button from './Button'

type Props = {
    buttons: ButtonType[]
    source: Source
}

function ButtonsGroup({buttons, source}: Props) {
    //buttons management
    const containerRef = useRef<HTMLDivElement | null>(null)
    const nbButtonDisplayed = useComputeNbButtonDisplayed(
        buttons,
        containerRef,
        source
    )

    // dropdown management
    const displayedButtons = buttons.slice(0, nbButtonDisplayed)
    const dropdownButtons = buttons.slice(nbButtonDisplayed)

    return (
        <div ref={containerRef}>
            <Group className={classnames(css.actionButtons)}>
                {displayedButtons.map((button, index) => {
                    return (
                        <TemplatedButton
                            key={index}
                            button={button}
                            source={source}
                        />
                    )
                })}
                {dropdownButtons.length > 0 && (
                    <UncontrolledDropdown>
                        <DropdownToggle tag={'span'}>
                            <IconButton size="small" intent="secondary">
                                more_horiz
                            </IconButton>
                        </DropdownToggle>
                        <DropdownMenu persist right>
                            {dropdownButtons.map((button, index) => (
                                <TemplatedButton
                                    key={index}
                                    button={button}
                                    source={source}
                                    isDropdown
                                />
                            ))}
                        </DropdownMenu>
                    </UncontrolledDropdown>
                )}
            </Group>
        </div>
    )
}

export default memo(ButtonsGroup)

function TemplatedButton({
    button,
    source,
    ...props
}: {
    button: ButtonType
    source: Source
} & Omit<ComponentProps<typeof Button>, 'label' | 'action'>) {
    const templateContext = useTemplateContext(source)
    const templatedAction: Action = {
        ...button.action,
        url: applyCustomActionTemplate(button.action.url, templateContext),
        params: mapTemplateParameters(button.action.params, templateContext),
        headers: mapTemplateParameters(button.action.headers, templateContext),
        body: {
            ...button.action.body,
            [ContentType.Form]: mapTemplateParameters(
                button.action.body[ContentType.Form],
                templateContext
            ),
            [ContentType.Json]: JSON.parse(
                applyCustomActionVariables(
                    JSON.stringify(button.action.body[ContentType.Json]),
                    templateContext.variables
                )
            ),
        },
    }
    return (
        <Button
            label={applyCustomActionTemplate(button.label, templateContext)}
            action={templatedAction}
            {...props}
        />
    )
}
