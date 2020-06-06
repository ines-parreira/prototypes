// @flow

import {type ComponentType, type Node} from 'react'

export type ParameterType = {
    name: string,
    type: string,
    label?: string,
    defaultValue?: string | number | boolean | null,
    placeholder?: string,
    required?: boolean,
    step?: number,
    min?: number,
    max?: number,
}

export type OptionType = {
    value: string,
    label?: string,
    parameters?: Array<ParameterType>
}

export type ActionType = {
    key: string,
    options: Array<OptionType>,
    title: Node,
    child: Object,
    popover?: string,
    tooltip?: string,
    modal?: ComponentType<InfobarModalProps>,
    modalData?: Object,
}

export type InfobarModalProps = {
    header: Node,
    isOpen: boolean,
    onOpen: (actionName: string | number) => void,
    onChange: (name: string, value: string | number | boolean | Object, callback?: () => void) => void,
    onBulkChange: (
        Array<{
            name: string,
            value: string | number | boolean | Object,
        }>,
        callback?: () => void
    ) => void,
    onSubmit: () => void,
    onClose: () => void,
    data: any,
}
