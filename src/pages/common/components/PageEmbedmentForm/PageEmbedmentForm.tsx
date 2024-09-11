import React, {useRef, useState, useEffect} from 'react'
import classNames from 'classnames'
import {Label, Tooltip} from '@gorgias/ui-kit'

import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import ModalBody from 'pages/common/components/modal/ModalBody'
import InputField from 'pages/common/forms/input/InputField'

import imageLayoutTop from 'assets/img/icons/layout-top.svg'
import imageLayoutBottom from 'assets/img/icons/layout-bottom.svg'

import {slugify} from 'utils/slugifyForShopify'
import {SHOPIFY_PAGE_EMBEDMENT_PATH_PREFIX} from './constants'
import {EmbedMode, PageEmbedmentPosition, EmbeddablePage} from './types'

import css from './PageEmbedmentForm.less'
import {
    PageEmbedmentFormReducerDispatch,
    PageEmbedmentFormReducerState,
} from './usePageEmbedmentForm'

export type PageEmbedmentFormProps = {
    modeSelectionTitle: string
    positionSelectionTitle: string
    dispatch: PageEmbedmentFormReducerDispatch
    state: PageEmbedmentFormReducerState
    pageNamePlaceholder: string
    pageSlugPlaceholder: string
    tooltipText: string | JSX.Element

    // TODO: define a real model for the shopify page
    shopifyPages: EmbeddablePage[]
}

/**
 * This is the form responsible for configuring the page embedment:
 * - mode: new
 * -- page name
 * -- slug
 * - mode: existing
 * -- page selection
 * -- position: top or bottom
 *
 * Will accepts a list of pages (dropdown selection)
 * Accepts a list of page-embedment (either contact form or help center embedment)
 * Expose the page embedment form state.
 */
const PageEmbedmentForm = ({
    modeSelectionTitle,
    positionSelectionTitle,
    pageNamePlaceholder,
    pageSlugPlaceholder,
    tooltipText,

    shopifyPages,
    state,
    dispatch,
}: PageEmbedmentFormProps) => {
    // Dropdown selection component required states
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    // form states
    const {
        isSlugTouched,
        embedMode,
        pageName,
        pageSlug,
        selectedPage,
        pagePosition,
    } = state

    // If the 'existing page' option is selected, we need to make sure that
    // when shopifyPages is empty, we switch to the 'new page' option.
    useEffect(() => {
        if (!shopifyPages.length)
            dispatch({
                type: 'setEmbedMode',
                payload: EmbedMode.NEW_PAGE,
            })
    }, [dispatch, shopifyPages.length, embedMode])

    return (
        <ModalBody className={css.modalBody}>
            <div>
                <h2 className={css.modalBodyHeading}>{modeSelectionTitle}</h2>
                <p>Only one page can be embedded at a time.</p>
            </div>
            {/* Radio buttons and tabs */}
            <div className={css.modeSelectionGroup}>
                <PreviewRadioButton
                    value={EmbedMode.NEW_PAGE}
                    isSelected={embedMode === EmbedMode.NEW_PAGE}
                    label="Embed to a new page"
                    caption="We'll create a new page for you in Shopify. Make sure to add it to your website navigation."
                    onClick={(ev) => {
                        ev.preventDefault()
                        dispatch({
                            type: 'setEmbedMode',
                            payload: EmbedMode.NEW_PAGE,
                        })
                    }}
                />
                {shopifyPages.length === 0 && (
                    <Tooltip
                        target="existing-page-embedment-radio-button"
                        placement="top"
                    >
                        {tooltipText}
                    </Tooltip>
                )}
                <PreviewRadioButton
                    id="existing-page-embedment-radio-button"
                    isDisabled={shopifyPages.length === 0}
                    value={EmbedMode.EXISTING_PAGE}
                    isSelected={embedMode === EmbedMode.EXISTING_PAGE}
                    label="Embed to existing page"
                    caption="Select an existing page from your website."
                    onClick={(ev) => {
                        ev.preventDefault()
                        dispatch({
                            type: 'setEmbedMode',
                            payload: EmbedMode.EXISTING_PAGE,
                        })
                    }}
                />
            </div>
            {/* TAB NEW PAGE */}
            <div
                className={classNames(css.tab, {
                    [css.tabActive]: embedMode === EmbedMode.NEW_PAGE,
                })}
            >
                <InputField
                    isRequired
                    className={css.inputField}
                    data-testid="page-name-input"
                    label="Page name"
                    placeholder={pageNamePlaceholder}
                    onChange={(nextValue) => {
                        dispatch({
                            type: 'setPageName',
                            payload: {
                                error: '',
                                value: nextValue,
                            },
                        })
                        if (!isSlugTouched) {
                            dispatch({
                                type: 'setPageSlug',
                                payload: {
                                    error: '',
                                    value: slugify(nextValue),
                                },
                            })
                        }
                    }}
                    error={pageName.error}
                    value={pageName.value}
                />
                <InputField
                    isRequired
                    className={css.inputField}
                    data-testid="page-slug-input"
                    label="Slug"
                    placeholder={pageSlugPlaceholder}
                    onChange={(nextValue) => {
                        const filteredValue = nextValue
                            .toLowerCase()
                            .replace(/[^a-z0-9_-]/g, '')

                        dispatch({
                            type: 'setPageSlug',
                            payload: {
                                isTouched: true,
                                error: '',
                                value: filteredValue,
                            },
                        })
                    }}
                    value={pageSlug.value}
                    caption="Page identifier added to the end of the URL"
                    error={pageSlug.error}
                />
            </div>

            {/* TAB EXISTING PAGE */}
            <div
                className={classNames(css.tab, {
                    [css.tabActive]: embedMode === EmbedMode.EXISTING_PAGE,
                })}
            >
                <Label isRequired>Select page</Label>
                <SelectInputBox
                    className={css.selectInputBox}
                    placeholder="Select a page"
                    onToggle={setIsDropdownOpen}
                    floating={floatingRef}
                    ref={targetRef}
                    label={selectedPage.title}
                >
                    <SelectInputBoxContext.Consumer>
                        {(context) => (
                            <Dropdown
                                placement="bottom"
                                isOpen={isDropdownOpen}
                                onToggle={() => context!.onBlur()}
                                ref={floatingRef}
                                target={targetRef}
                                value={selectedPage.external_id}
                                shouldFlip={false}
                            >
                                <DropdownSearch
                                    placeholder="Select page"
                                    autoFocus
                                />
                                <DropdownBody>
                                    {shopifyPages.map(
                                        ({
                                            external_id,
                                            title,
                                            url_path,
                                            body_html,
                                        }) => (
                                            <DropdownItem
                                                key={external_id}
                                                option={{
                                                    // This label is only used as a reference for the
                                                    // searchable string value
                                                    label: `${title}/${url_path}`,
                                                    value: external_id,
                                                }}
                                                onClick={() =>
                                                    dispatch({
                                                        type: 'setSelectedPage',
                                                        payload: {
                                                            external_id,
                                                            title,
                                                            url_path,
                                                            body_html,
                                                        },
                                                    })
                                                }
                                                shouldCloseOnSelect
                                            >
                                                {/* This is where we determine how each item will present the data */}
                                                <div
                                                    className={css.dropdownItem}
                                                >
                                                    {title} <br />
                                                    <span
                                                        className={
                                                            css.dropdownItemSlug
                                                        }
                                                    >
                                                        {url_path?.replace(
                                                            SHOPIFY_PAGE_EMBEDMENT_PATH_PREFIX,
                                                            ''
                                                        )}
                                                    </span>
                                                </div>
                                            </DropdownItem>
                                        )
                                    )}
                                </DropdownBody>
                            </Dropdown>
                        )}
                    </SelectInputBoxContext.Consumer>
                </SelectInputBox>

                {!!selectedPage.title && (
                    <div
                        className={classNames({
                            [css.hidden]: !selectedPage,
                            [css.pagePositionSelectionSection]:
                                Boolean(selectedPage),
                        })}
                    >
                        <h2 className={css.modalBodyHeading}>
                            {positionSelectionTitle}
                        </h2>
                        <p>
                            You can modify the position anytime after embedding
                            it.
                        </p>

                        <div className={css.pagePositionSelectionGroup}>
                            <PreviewRadioButton
                                value={PageEmbedmentPosition.TOP}
                                isSelected={
                                    pagePosition === PageEmbedmentPosition.TOP
                                }
                                label="Top"
                                preview={
                                    <img
                                        src={imageLayoutTop}
                                        alt="layout top of the page"
                                    />
                                }
                                onClick={(ev) => {
                                    ev.preventDefault()
                                    dispatch({
                                        type: 'setPagePosition',
                                        payload: PageEmbedmentPosition.TOP,
                                    })
                                }}
                            />
                            <PreviewRadioButton
                                value={PageEmbedmentPosition.BOTTOM}
                                isSelected={
                                    pagePosition ===
                                    PageEmbedmentPosition.BOTTOM
                                }
                                label="Bottom"
                                preview={
                                    <img
                                        src={imageLayoutBottom}
                                        alt="layout bottom of the page"
                                    />
                                }
                                onClick={(ev) => {
                                    ev.preventDefault()
                                    dispatch({
                                        type: 'setPagePosition',
                                        payload: PageEmbedmentPosition.BOTTOM,
                                    })
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </ModalBody>
    )
}

export default PageEmbedmentForm
