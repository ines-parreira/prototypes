import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'

import {gorgiasColors} from 'gorgias-design-system/styles'

import Tooltip from 'pages/common/components/Tooltip'
import type {LanguageItemRow} from './types'

type GorgiasChatIntegrationLanguagesTableRowActionsProps = {
    language: LanguageItemRow
    onClickDelete?: (language: LanguageItemRow) => void
    onClickSetAsDefault?: (language: LanguageItemRow) => void
}

export const GorgiasChatIntegrationLanguagesTableRowActions = ({
    language,
    onClickDelete,
    onClickSetAsDefault,
}: GorgiasChatIntegrationLanguagesTableRowActionsProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const onToggle = () => {
        setIsOpen((isCurrentOpen) => !isCurrentOpen)
    }

    return (
        <>
            <Link to={language.link}>Customize</Link>

            {language.showActions && (
                <>
                    <Dropdown
                        isOpen={isOpen}
                        toggle={onToggle}
                        className="ml-4"
                    >
                        <DropdownToggle disabled={language.primary} tag="span">
                            <i
                                className="material-icons"
                                data-testid="more-actions-button"
                                id={`more-actions-${language.language}-help`}
                                style={{
                                    fontSize: 20,
                                    color: language.primary
                                        ? gorgiasColors.neutralGrey3
                                        : gorgiasColors.neutralGrey5,
                                }}
                            >
                                more_vert
                            </i>
                            <Tooltip
                                autohide={false}
                                delay={100}
                                disabled={!language.primary}
                                target={`more-actions-${language.language}-help`}
                                placement="bottom-end"
                            >
                                Change your default language to delete{' '}
                                {language.language}.
                            </Tooltip>
                        </DropdownToggle>

                        <DropdownMenu right style={{marginTop: 8, padding: 8}}>
                            <DropdownItem
                                data-testid="action-set-default-button"
                                key="action-set-default-button"
                                onClick={() =>
                                    onClickSetAsDefault &&
                                    onClickSetAsDefault(language)
                                }
                            >
                                Make default language
                            </DropdownItem>

                            <DropdownItem
                                data-testid="action-delete-button"
                                key="action-delete-button"
                                onClick={() =>
                                    onClickDelete && onClickDelete(language)
                                }
                                style={{
                                    color: gorgiasColors.secondaryRed,
                                    padding: 8,
                                }}
                            >
                                Delete
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </>
            )}
        </>
    )
}
