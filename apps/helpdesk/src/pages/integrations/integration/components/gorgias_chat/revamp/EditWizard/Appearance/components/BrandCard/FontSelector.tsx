import React, { useEffect, useMemo, useState } from 'react'
import {
    ListHeader,
    ListHeaderItem,
    ListItem,
    ListSection,
    SelectField,
} from '@gorgias/axiom'
import { uniq } from '@gorgias/toolkit'

import { GORGIAS_CHAT_DEFAULT_FONTS } from 'config/integrations/gorgias_chat'
import {
    FontCatalogueModal,
    getMultipleFontLink,
} from 'pages/settings/common/FontSelectField/components/FontCatalogueModal/FontCatalogueModal'

const AGENT_ADDED_FONTS = 'gorgias.agent-added-fonts'

type Props = {
    mainFontFamily: string
    onMainFontFamilyChange: (value: string) => void
}

type FontItem = { id: string }
type FontSection = { id: string; name?: string; items: FontItem[] }

const getFontsFromLocalStorage = (): string[] => {
    const agentAddedFonts = localStorage.getItem(AGENT_ADDED_FONTS)
    return agentAddedFonts ? (JSON.parse(agentAddedFonts) as string[]) : []
}

const addLinkToDownloadFonts = (fonts: string[]) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = getMultipleFontLink(fonts)
    document.body.appendChild(link)
}

export const FontSelector = ({
    mainFontFamily,
    onMainFontFamilyChange,
}: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedFont, setSelectedFont] = useState(mainFontFamily)
    const [fontsFromLocalStorage, setFontsFromLocalStorage] = useState(() =>
        getFontsFromLocalStorage(),
    )

    useEffect(() => {
        if (
            fontsFromLocalStorage.length === 0 &&
            GORGIAS_CHAT_DEFAULT_FONTS.includes(selectedFont)
        ) {
            return
        }

        void addLinkToDownloadFonts(
            GORGIAS_CHAT_DEFAULT_FONTS.includes(selectedFont)
                ? fontsFromLocalStorage
                : [...fontsFromLocalStorage, selectedFont],
        )
    }, [fontsFromLocalStorage, selectedFont])

    const recentlyAddedFonts = GORGIAS_CHAT_DEFAULT_FONTS.includes(selectedFont)
        ? fontsFromLocalStorage
        : uniq([selectedFont, ...fontsFromLocalStorage])

    const fontSections: FontSection[] = useMemo(() => {
        const shouldDisplayHeaders =
            recentlyAddedFonts.length > 1 ||
            (recentlyAddedFonts.length === 1 &&
                selectedFont !== recentlyAddedFonts[0])

        const recentItems = recentlyAddedFonts.map((id) => ({ id }))
        const defaultItems = GORGIAS_CHAT_DEFAULT_FONTS.map((id) => ({ id }))

        if (!shouldDisplayHeaders) {
            return [{ id: 'all', items: [...recentItems, ...defaultItems] }]
        }

        return [
            {
                id: 'recently-added',
                name: 'RECENTLY ADDED',
                items: recentItems,
            },
            {
                id: 'standard',
                name: 'STANDARD FONTS',
                items: defaultItems,
            },
        ]
    }, [recentlyAddedFonts, selectedFont])

    return (
        <div>
            <SelectField<FontItem, FontSection>
                items={fontSections}
                value={{ id: selectedFont }}
                onChange={(item) => {
                    onMainFontFamilyChange(item.id)
                    setSelectedFont(item.id)
                }}
                placeholder="Select a font"
                maxHeight={376}
                header={
                    <ListHeader>
                        <ListHeaderItem
                            label="More fonts"
                            leadingSlot="plus"
                            onClick={() => setIsModalOpen(true)}
                        />
                    </ListHeader>
                }
                aria-label="Font family"
            >
                {(section) => (
                    <ListSection
                        id={section.id}
                        name={section.name}
                        items={section.items}
                    >
                        {(item) => (
                            <ListItem
                                label={
                                    <span
                                        style={{
                                            fontFamily: item.id,
                                        }}
                                    >
                                        {item.id}
                                    </span>
                                }
                                textValue={item.id}
                            />
                        )}
                    </ListSection>
                )}
            </SelectField>
            <FontCatalogueModal
                recentlyAddedFonts={recentlyAddedFonts}
                setFontsFromLocalStorage={setFontsFromLocalStorage}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                currentPrimaryFont={selectedFont}
            />
        </div>
    )
}
