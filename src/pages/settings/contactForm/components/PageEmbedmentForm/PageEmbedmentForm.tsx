import React, {useRef, useState} from 'react'

import classNames from 'classnames'

import Label from 'pages/common/forms/Label/Label'
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

import {EmbedMode, PagePosition, ShopifyPage} from './types'

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

    // TODO: define a real model for the shopify page
    shopifyPages: ShopifyPage[]
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

    shopifyPages,
    state,
    dispatch,
}: PageEmbedmentFormProps) => {
    // Dropdown selection component required states
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    // form states
    const {embedMode, pageName, pageSlug, selectedPage, pagePosition} = state

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
                <PreviewRadioButton
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
                    className={css.inputField}
                    label="Page name"
                    placeholder="ie. Contact Form"
                    onChange={(nextValue) => {
                        dispatch({
                            type: 'setPageName',
                            payload: {
                                error: '',
                                value: nextValue,
                            },
                        })
                    }}
                    error={pageName.error}
                    value={pageName.value}
                />
                <InputField
                    className={css.inputField}
                    label="Slug"
                    placeholder="ie. contact-form"
                    onChange={(nextValue) => {
                        dispatch({
                            type: 'setPageSlug',
                            payload: {
                                error: '',
                                value: nextValue,
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
                <Label>Select page</Label>
                <SelectInputBox
                    className={css.selectInputBox}
                    placeholder="Select a page"
                    onToggle={setIsDropdownOpen}
                    floating={floatingRef}
                    ref={targetRef}
                    label={selectedPage.name}
                >
                    <SelectInputBoxContext.Consumer>
                        {(context) => (
                            <Dropdown
                                isOpen={isDropdownOpen}
                                onToggle={() => context!.onBlur()}
                                ref={floatingRef}
                                target={targetRef}
                                value={selectedPage.id}
                            >
                                <DropdownSearch
                                    placeholder="Select page name"
                                    autoFocus
                                />
                                <DropdownBody>
                                    {/* {options.map((option) => ( */}
                                    {shopifyPages.map(({id, name, slug}) => (
                                        <DropdownItem
                                            key={id}
                                            option={{
                                                // This label is only used as a reference for the
                                                // searchable string value
                                                label: name + ' /' + slug,
                                                value: id,
                                            }}
                                            onClick={() =>
                                                dispatch({
                                                    type: 'setSelectedPage',
                                                    payload: {
                                                        id,
                                                        name,
                                                        slug,
                                                    },
                                                })
                                            }
                                            shouldCloseOnSelect
                                        >
                                            {/* This is where we determine how each item will present the data */}
                                            <div className={css.dropdownItem}>
                                                {name} <br />
                                                <span
                                                    className={
                                                        css.dropdownItemSlug
                                                    }
                                                >
                                                    /{slug}
                                                </span>
                                            </div>
                                        </DropdownItem>
                                    ))}
                                </DropdownBody>
                            </Dropdown>
                        )}
                    </SelectInputBoxContext.Consumer>
                </SelectInputBox>

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
                        You can modify the position anytime after embedding it.
                    </p>

                    <div className={css.pagePositionSelectionGroup}>
                        <PreviewRadioButton
                            value={PagePosition.TOP}
                            isSelected={pagePosition === PagePosition.TOP}
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
                                    payload: PagePosition.TOP,
                                })
                            }}
                        />
                        <PreviewRadioButton
                            value={PagePosition.BOTTOM}
                            isSelected={pagePosition === PagePosition.BOTTOM}
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
                                    payload: PagePosition.BOTTOM,
                                })
                            }}
                        />
                    </div>
                </div>
            </div>
        </ModalBody>
    )
}

export default PageEmbedmentForm
