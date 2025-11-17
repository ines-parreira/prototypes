import { useCallback, useRef } from 'react'

import { useId } from '@repo/hooks'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'
import type { Language } from '@gorgias/helpdesk-types'

import Loader from 'pages/common/components/Loader/Loader'

import type { ActionInjectedProps } from '../../types'
import Button from '../Button'
import { useLanguageDropdown } from './hooks/useLanguageDropdown'
import { useOutboundTranslation } from './hooks/useOutboundTranslation'
import LanguageDropdown from './LanguageDropdown'

import css from './Translate.less'

type Props = ActionInjectedProps

export default function Translate({ getEditorState, setEditorState }: Props) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const randomId = useId()
    const loaderId = `translate-loader-${randomId}`

    const {
        isTranslating,
        hasTranslation,
        requestTranslation,
        toggleOriginal,
    } = useOutboundTranslation(getEditorState, setEditorState)

    const {
        isOpen,
        searchTerm,
        detectedLanguage,
        filteredLanguages,
        toggleDropdown,
        closeDropdown,
        setSearchTerm,
    } = useLanguageDropdown()

    const handleButtonClick = useCallback(() => {
        if (hasTranslation) {
            toggleOriginal()
        } else {
            toggleDropdown()
        }
    }, [hasTranslation, toggleOriginal, toggleDropdown])

    const handleLanguageSelect = useCallback(
        (languageCode: string) => {
            requestTranslation(languageCode as Language)
            closeDropdown()
        },
        [requestTranslation, closeDropdown],
    )

    if (isTranslating) {
        return (
            <>
                <div className={css.loaderContainer} id={loaderId}>
                    <Loader
                        inline
                        size="12px"
                        className={css.loader}
                        aria-label="Translating message"
                    />
                </div>
                <Tooltip autohide={false} target={loaderId} placement="bottom">
                    Translating...
                </Tooltip>
            </>
        )
    }

    return (
        <>
            <Button
                onToggle={handleButtonClick}
                isDisabled={false}
                isActive={hasTranslation}
                name={hasTranslation ? 'Show original' : 'Translate message'}
                icon={hasTranslation ? 'undo' : 'translate'}
                ref={buttonRef}
            />
            <LanguageDropdown
                isOpen={isOpen}
                searchTerm={searchTerm}
                detectedLanguage={detectedLanguage}
                filteredLanguages={filteredLanguages}
                buttonRef={buttonRef}
                onClose={closeDropdown}
                onSearchChange={setSearchTerm}
                onLanguageSelect={handleLanguageSelect}
            />
        </>
    )
}
