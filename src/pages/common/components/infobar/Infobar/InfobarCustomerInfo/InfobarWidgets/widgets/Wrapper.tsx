import React, {useCallback, useState, useContext} from 'react'
import {Map, fromJS} from 'immutable'
import _last from 'lodash/last'
import classnames from 'classnames'
import {Popover, PopoverBody} from 'reactstrap'

import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {EditionContext} from 'providers/infobar/EditionContext'
import {IntegrationType} from 'models/integration/types'
import useId from 'hooks/useId'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
} from 'state/widgets/actions'
import * as integrationsSelectors from 'state/integrations/selectors'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import {WIDGET_COLOR_SUPPORTED_TYPES} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/constants.js'
import {Editing} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarCustomerInfo'
import InfobarWidget from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/InfobarWidget.js'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import css from './Wrapper.less'
import WrapperEdit from './forms/WrapperEdit'

type Props = {
    editing?: Editing
    source: Map<string, unknown>
    widget: Map<string, unknown>
    template: Map<string, unknown>
}

export default function Wrapper({widget, template, source, editing}: Props) {
    const dispatch = useAppDispatch()
    const {isEditing} = useContext(EditionContext)
    const id = useId()
    const uniqueId = 'card-wrapper-' + id
    const [isPopupOpen, setPopupOpen] = useState(false)

    const handleClosePopover = useCallback(() => {
        setPopupOpen(false)
    }, [])

    const absolutePath = template.get('absolutePath', []) as string[]
    const templatePath = template.get('templatePath', '') as string

    const widgetType = widget.get('type') as IntegrationType

    const integration = useIntegration(absolutePath, widgetType)

    const customColor = template.getIn(['meta', 'color'], '') as string
    const borderColor = customColor
        ? {
              boxShadow: `inset 3px 0 0 ${customColor}`,
          }
        : undefined

    const colorClassNames = []
    if (WIDGET_COLOR_SUPPORTED_TYPES.includes(widgetType))
        colorClassNames.push(css[widgetType])

    return (
        <IntegrationContext.Provider
            value={{
                integration,
                integrationId: integration.get('id'),
            }}
        >
            <div
                className={classnames(
                    'draggable',
                    css.widgetWrapper,
                    ...colorClassNames,
                    {
                        [css.widgetWrapperEditing]: isEditing,
                    }
                )}
                style={borderColor}
            >
                {!isEditing && <div id={widgetType} className={css.anchor} />}
                {isEditing && (
                    <div className={css.widgetWrapperTools} id={uniqueId}>
                        {widgetType === IntegrationType.Http && (
                            <Button
                                type="button"
                                intent="primary"
                                fillStyle="ghost"
                                size="small"
                                onClick={() => {
                                    dispatch(startWidgetEdition(templatePath))
                                    setPopupOpen(true)
                                }}
                            >
                                <ButtonIconLabel icon="edit">
                                    Customize Widget
                                    <Popover
                                        placement="left"
                                        isOpen={isPopupOpen}
                                        target={uniqueId}
                                        toggle={() => {
                                            dispatch(stopWidgetEdition())
                                            setPopupOpen(false)
                                        }}
                                        trigger="legacy"
                                    >
                                        <PopoverBody>
                                            <WrapperEdit
                                                template={template}
                                                onClose={handleClosePopover}
                                            />
                                        </PopoverBody>
                                    </Popover>
                                </ButtonIconLabel>
                            </Button>
                        )}
                        <Button
                            intent="destructive"
                            fillStyle="ghost"
                            size="small"
                            onClick={() => {
                                dispatch(
                                    removeEditedWidget(
                                        templatePath,
                                        absolutePath
                                    )
                                )
                            }}
                        >
                            <ButtonIconLabel icon="delete">
                                Delete Widget
                            </ButtonIconLabel>
                        </Button>
                    </div>
                )}

                <DragWrapper
                    sort
                    group={{
                        name: absolutePath.join('.'),
                        pull: false,
                        put: true,
                    }}
                    templatePath={templatePath}
                    isEditing={isEditing}
                    watchDrop
                >
                    {(
                        template.get('widgets', fromJS([])) as Map<
                            string,
                            unknown
                        >
                    ).map((mappedWidget, index = '') => {
                        const passedTemplate = (
                            mappedWidget as Map<string, unknown>
                        ).set(
                            'templatePath',
                            `${templatePath}.widgets.${index}`
                        )

                        return (
                            <InfobarWidget
                                key={`${
                                    passedTemplate.get('path') as string
                                }-${index}`}
                                source={source}
                                parent={template}
                                widget={widget}
                                template={passedTemplate}
                                editing={editing}
                                isEditing={isEditing}
                            />
                        )
                    })}
                </DragWrapper>
            </div>
        </IntegrationContext.Provider>
    )
}

function useIntegration(absolutePath: string[], widgetType: IntegrationType) {
    const integrations = useAppSelector(
        integrationsSelectors.getIntegrationsByTypes(widgetType)
    )

    const integrationId = parseInt(_last(absolutePath) || '')

    const integration = useAppSelector(
        integrationsSelectors.getIntegrationById(integrationId)
    )

    if (isNaN(integrationId)) {
        return (
            integrations.isEmpty() ? fromJS({}) : integrations.first()
        ) as Map<any, any>
    }

    return integration
}
