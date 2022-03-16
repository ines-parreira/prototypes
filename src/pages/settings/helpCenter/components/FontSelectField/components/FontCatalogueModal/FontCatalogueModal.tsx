import React, {useEffect, useMemo, useState} from 'react'
import uniq from 'lodash/uniq'
import ReactList from 'react-list'
import _isEqual from 'lodash/isEqual'
import Modal from 'pages/common/components/Modal'
import Button from 'pages/common/components/button/Button'
import SelectFilter from 'pages/stats/common/SelectFilter'
import Search from 'pages/common/components/Search'

import {useGoogleFonts} from '../../hooks'
import {AGENT_ADDED_FONTS} from '../../constants'
import css from './FontCatalogueModal.less'

type Props = {
    recentlyAddedFonts: string[]
    setFontsFromLocalStorage: (fonts: string[]) => void
    isModalOpen: boolean
    setIsModalOpen: (val: boolean) => void
}

const saveFontsInLocalStorage = (fonts: string[]) => {
    localStorage.setItem(AGENT_ADDED_FONTS, JSON.stringify(fonts))
}

export const getMultipleFontLink = (fonts: string[]) => {
    const fontOptions = '&display=swap'
    const formattedFonts = fonts.reduce(
        (acc, font) => (acc === '' ? `${font}` : `${acc}&family=${font}`),
        ''
    )

    return `https://fonts.googleapis.com/css2?family=${formattedFonts}${fontOptions}`
}

export const getFontsAfterSearch = ({
    search,
    fonts,
    categories,
}: {
    search: string
    fonts: {family: string; category: string}[]
    categories: string[]
}) => {
    const filteredFontsByCategory =
        categories.length === 0
            ? fonts
            : fonts.filter((font) => categories.includes(font.category))

    const fontsStartingWith = filteredFontsByCategory.filter((font) =>
        font.family.toLowerCase().startsWith(search.toLowerCase())
    )
    const fontsIncluding = filteredFontsByCategory.filter((font) =>
        font.family.toLowerCase().includes(search.toLowerCase())
    )

    return uniq([...fontsStartingWith, ...fontsIncluding])
}

export const FontCatalogueModal = ({
    recentlyAddedFonts,
    setFontsFromLocalStorage,
    isModalOpen,
    setIsModalOpen,
}: Props) => {
    const {googleFonts} = useGoogleFonts()
    const categories = uniq(googleFonts.map((font) => font.category))
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedFonts, setSelectedFonts] =
        useState<string[]>(recentlyAddedFonts)
    const [search, setSearch] = useState('')
    const [displayedFonts, setDisplayedFonts] = useState(googleFonts)
    const [haveFontsBeenFetched, setHaveFontsBeenFetched] = useState(false)

    useEffect(() => {
        if (googleFonts.length === 0 || !isModalOpen || haveFontsBeenFetched) {
            return
        }
        const addLinksToDownloadFonts = () => {
            const inputArray = googleFonts.map((font) => font.family)

            let i, j, temporary
            const chunk = 200

            for (i = 0, j = inputArray.length; i < j; i += chunk) {
                temporary = inputArray.slice(i, i + chunk)
                const link = document.createElement('link')
                link.rel = 'stylesheet'
                link.type = 'text/css'
                link.href = getMultipleFontLink(temporary)
                document.body.appendChild(link)
            }

            setHaveFontsBeenFetched(true)
        }

        void addLinksToDownloadFonts()
    }, [googleFonts, isModalOpen, haveFontsBeenFetched])

    useEffect(() => {
        setDisplayedFonts(
            getFontsAfterSearch({
                search,
                fonts: googleFonts,
                categories: selectedCategories,
            })
        )
        // We can use googleFonts.length since it is fetched only once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, googleFonts.length, selectedCategories])

    const closeModal = () => {
        setIsModalOpen(false)
        setSearch('')
        setSelectedCategories([])
    }

    const canSaveSelectedFonts = useMemo(() => {
        if (
            !_isEqual(
                recentlyAddedFonts.sort((a, b) => (a > b ? 1 : -1)),
                selectedFonts
            )
        ) {
            return true
        }

        return false
    }, [recentlyAddedFonts, selectedFonts])

    return (
        <Modal
            isOpen={isModalOpen}
            className={css['modal-centered']}
            bodyClassName={css['modalBody']}
            header={'Add More Fonts'}
            onClose={() => closeModal()}
            footerClassName={css.footerWrapper}
            footer={
                <>
                    <Button
                        intent="secondary"
                        type="button"
                        onClick={() => {
                            closeModal()
                            setSelectedFonts(recentlyAddedFonts)
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            closeModal()
                            saveFontsInLocalStorage(selectedFonts)
                            setFontsFromLocalStorage(selectedFonts)
                        }}
                        isDisabled={!canSaveSelectedFonts}
                    >
                        Save Selected Fonts
                    </Button>
                </>
            }
        >
            <div className={css.modalBody}>
                <div className={css.fontExplorer}>
                    <div className={css.fontExplorerHeader}>
                        <div className={css.fontSearchBar}>
                            <Search
                                data-testid="Search"
                                placeholder="Search for fonts"
                                onChange={setSearch}
                                className={css.search}
                                forcedQuery={search}
                            />
                        </div>
                        <div>
                            <SelectFilter
                                plural="categories"
                                singular="category"
                                onChange={(values) =>
                                    setSelectedCategories(values as string[])
                                }
                                value={selectedCategories}
                                toggleClassName=""
                            >
                                {categories.map((category) => (
                                    <SelectFilter.Item
                                        key={category}
                                        value={category}
                                        label={category}
                                    />
                                ))}
                            </SelectFilter>
                        </div>
                    </div>
                    <div className={css.fontList}>
                        {displayedFonts.length > 0 ? (
                            <ReactList
                                itemRenderer={(index, key) => {
                                    const font = displayedFonts[index]

                                    return (
                                        <div
                                            key={key}
                                            onClick={() => {
                                                if (
                                                    selectedFonts.includes(
                                                        font.family
                                                    )
                                                ) {
                                                    setSelectedFonts(
                                                        selectedFonts.filter(
                                                            (selectedFont) =>
                                                                selectedFont !==
                                                                font.family
                                                        )
                                                    )
                                                } else {
                                                    setSelectedFonts(
                                                        [
                                                            ...selectedFonts,
                                                            font.family,
                                                        ].sort((a, b) =>
                                                            a > b ? 1 : -1
                                                        )
                                                    )
                                                }
                                            }}
                                            className={css.availableFont}
                                        >
                                            <span
                                                style={{
                                                    fontFamily: font.family,
                                                }}
                                            >
                                                {font.family}
                                            </span>
                                            {selectedFonts.includes(
                                                font.family
                                            ) && (
                                                <i
                                                    className="material-icons mr-2"
                                                    style={{
                                                        color: '#4A8DF9',
                                                    }}
                                                >
                                                    done
                                                </i>
                                            )}
                                        </div>
                                    )
                                }}
                                length={displayedFonts.length}
                                type="simple"
                                pageSize={200}
                            />
                        ) : (
                            <div className={css.noFontFound}>
                                <p>
                                    Sorry, we didn't find a font matching your
                                    search criteria
                                    <br />
                                    in our font's library.
                                    <br />
                                    You can add a custom font in your help
                                    center following{' '}
                                    <a href="https://docs.gorgias.com/help-center/advanced-help-center-customization-with-html#custom_font">
                                        this documentation
                                    </a>
                                    .
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className={css.selectedFontsContainerList}>
                    <div className={css.fontListTitle}>Selected Fonts</div>
                    <div className={css.selectedFontList}>
                        {selectedFonts.map((font) => (
                            <div key={font} className={css.selectedFont}>
                                <span style={{fontFamily: font}}>{font}</span>
                                <i
                                    className="material-icons mr-2"
                                    style={{
                                        color: '#99A5B6',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                        setSelectedFonts(
                                            selectedFonts.filter(
                                                (selectedFont) =>
                                                    selectedFont !== font
                                            )
                                        )
                                    }}
                                >
                                    close
                                </i>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    )
}
