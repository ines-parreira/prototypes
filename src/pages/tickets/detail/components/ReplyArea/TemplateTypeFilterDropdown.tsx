import React from 'react'

import classNames from 'classnames'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import { TicketChannel } from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import useWhatsAppEditor from 'pages/integrations/integration/components/whatsapp/useWhatsAppEditor'
import {
    getNewMessageChannel,
    isNewMessagePublic,
} from 'state/newMessage/selectors'

import { TemplateTypeFilterOption } from './types'

import css from './TemplateTypeFilterDropdown.less'

type Props = {
    value: TemplateTypeFilterOption
}

export default function TemplateTypeFilterDropdown({ value }: Props) {
    const { setSelectedTemplateType } = useWhatsAppEditor()

    const channel = useAppSelector(getNewMessageChannel)
    const isPublicNewMessage = useAppSelector(isNewMessagePublic)

    if (!(channel === TicketChannel.WhatsApp && isPublicNewMessage)) {
        return null
    }

    return (
        <UncontrolledDropdown size="sm" className={css.container}>
            <DropdownToggle caret color="secondary" type="button">
                {value === TemplateTypeFilterOption.Templates
                    ? 'Templates'
                    : 'Macros'}
            </DropdownToggle>
            <DropdownMenu right>
                <TemplateTypeDropdownItem
                    onClick={() =>
                        setSelectedTemplateType(TemplateTypeFilterOption.Macros)
                    }
                    isSelected={value === TemplateTypeFilterOption.Macros}
                >
                    <i className="material-icons">bolt</i>
                    Macros
                </TemplateTypeDropdownItem>
                <TemplateTypeDropdownItem
                    onClick={() =>
                        setSelectedTemplateType(
                            TemplateTypeFilterOption.Templates,
                        )
                    }
                    isSelected={value === TemplateTypeFilterOption.Templates}
                >
                    <i className="icon-custom icon-whatsapp" />
                    Templates
                </TemplateTypeDropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}

type TemplateTypeDropdownItemProps = {
    children: React.ReactNode
    onClick: () => void
    isSelected: boolean
}

const TemplateTypeDropdownItem = ({
    children,
    onClick,
    isSelected,
}: TemplateTypeDropdownItemProps) => (
    <DropdownItem type="button" className={css.dropdownItem} onClick={onClick}>
        {children}
        {isSelected && (
            <i className={classNames('material-icons', css.checkIcon)}>check</i>
        )}
    </DropdownItem>
)
