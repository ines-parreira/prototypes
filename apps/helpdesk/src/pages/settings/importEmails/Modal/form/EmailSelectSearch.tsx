import { useRef, useState } from 'react'

import { Link } from 'react-router-dom'

import { IntegrationType } from '@gorgias/helpdesk-client'

import gmailIcon from 'assets/img/integrations/gmail.svg'
import outlookIcon from 'assets/img/integrations/outlook.svg'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import type { EmailOption } from './EmailMultiselect'

import css from '../CreateImportModal.less'

type EmailSelectSearchProps = {
    emailOptions: EmailOption[]
    email: string
    setEmail: (email: string) => void
}

export const EmailSelectSearch = ({
    emailOptions,
    email,
    setEmail,
}: EmailSelectSearchProps) => {
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const getProviderIcon = (provider: EmailOption['provider']) => {
        switch (provider) {
            case IntegrationType.Gmail:
                return gmailIcon
            case IntegrationType.Outlook:
                return outlookIcon
            case IntegrationType.Email:
                return (
                    <i className={`material-icons ${css.materialIcon}`}>
                        forward_to_inbox
                    </i>
                )
            default:
                return (
                    <i className={`material-icons ${css.materialIcon}`}>
                        email
                    </i>
                )
        }
    }

    return (
        <SelectInputBox
            floating={floatingRef}
            label={email || null}
            onToggle={setIsOpen}
            placeholder="support@yourcompany.com"
            ref={targetRef}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={isOpen}
                        onToggle={() => context!.onBlur()}
                        ref={floatingRef as any}
                        target={targetRef}
                        value={email}
                    >
                        <DropdownSearch autoFocus />
                        <DropdownBody>
                            {emailOptions.map((option) => (
                                <DropdownItem
                                    key={option.email}
                                    option={{
                                        label: option.email,
                                        value: option.email,
                                    }}
                                    onClick={() => setEmail(option.email)}
                                    shouldCloseOnSelect
                                >
                                    <div className={css.emailOptionContainer}>
                                        {typeof getProviderIcon(
                                            option.provider,
                                        ) === 'string' ? (
                                            <img
                                                src={
                                                    getProviderIcon(
                                                        option.provider,
                                                    ) as string
                                                }
                                                alt={option.provider}
                                                className={css.providerIcon}
                                            />
                                        ) : (
                                            <span
                                                className={css.providerIconSpan}
                                            >
                                                {getProviderIcon(
                                                    option.provider,
                                                )}
                                            </span>
                                        )}
                                        <span>{option.email}</span>
                                    </div>
                                </DropdownItem>
                            ))}

                            <Link to="/app/settings/channels/email">
                                <div className={css.addEmailContainer}>
                                    <i
                                        className={`material-icons ${css.addEmailIcon}`}
                                    >
                                        add
                                    </i>
                                    <span>Add new email</span>
                                </div>
                            </Link>
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
