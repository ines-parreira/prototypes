import React, {useCallback, useState} from 'react'
import {Link} from 'react-router-dom'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'

import {gorgiasColors} from 'gorgias-design-system/styles'

import Tooltip from 'pages/common/components/Tooltip'
import GorgiasChatIntegrationLanguageDeleteModal from './GorgiasChatIntegrationLanguageDeleteModal'
import type {LanguageItemRow} from './types'

type GorgiasChatIntegrationLanguagesTableRowActionsProps = {
    language: LanguageItemRow
    onClickDelete?: (language: LanguageItemRow) => void
    onClickSetDefault?: (language: LanguageItemRow) => void
}

export const GorgiasChatIntegrationLanguagesTableRowActions = ({
    language,
    onClickDelete,
    onClickSetDefault,
}: GorgiasChatIntegrationLanguagesTableRowActionsProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const onDiscard = useCallback(() => setIsModalOpen(false), [])

    const onDelete = useCallback(() => {
        onClickDelete && onClickDelete(language)
        onDiscard()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, onClickDelete])

    return (
        <>
            <Link to={language.link}>Customize</Link>

            {language.showActions && (
                <>
                    <GorgiasChatIntegrationLanguageDeleteModal
                        isOpen={isModalOpen}
                        language={language.label}
                        onConfirm={onDelete}
                        onDiscard={onDiscard}
                    />

                    <Dropdown
                        isOpen={isDropdownOpen}
                        toggle={() =>
                            setIsDropdownOpen((isCurrentOpen) => !isCurrentOpen)
                        }
                        className="ml-4"
                    >
                        <DropdownToggle disabled={language.primary} tag="span">
                            <i
                                data-testid="more-actions-button"
                                className="material-icons"
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
                                {language.label}.
                            </Tooltip>
                        </DropdownToggle>

                        <DropdownMenu right style={{marginTop: 8, padding: 8}}>
                            <DropdownItem
                                data-testid="action-set-default-button"
                                key="action-set-default-button"
                                onClick={() =>
                                    onClickSetDefault &&
                                    onClickSetDefault(language)
                                }
                            >
                                Make default language
                            </DropdownItem>

                            <DropdownItem
                                data-testid="action-delete-button"
                                key="action-delete-button"
                                onClick={() => setIsModalOpen(true)}
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
