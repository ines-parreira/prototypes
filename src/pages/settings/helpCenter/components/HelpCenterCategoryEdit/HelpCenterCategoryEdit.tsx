import React, {ChangeEvent, useEffect, useMemo, useRef, useState} from 'react'
import classNames from 'classnames'
import copy from 'copy-to-clipboard'
import {
    FormGroup,
    FormText,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {SCREEN_SIZE, useScreenSize} from 'hooks/useScreenSize'
import {
    Category,
    CreateCategoryDto,
    HelpCenter,
    LocalCategoryTranslation,
    LocaleCode,
    UpdateCategoryTranslationDto,
} from 'models/helpCenter/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {Drawer} from 'pages/common/components/Drawer'
import Tooltip from 'pages/common/components/Tooltip'
import AutoPopulateInput from 'pages/common/forms/AutoPopulateInput/AutoPopulateInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Option, Value} from 'pages/common/forms/SelectField/types'
import {
    DRAWER_TRANSITION_DURATION_MS,
    HELP_CENTER_DEFAULT_LOCALE,
    HELP_CENTER_TITLE_MAX_LENGTH,
} from 'pages/settings/helpCenter/constants'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {
    getAbsoluteUrl,
    getCategoryUrl,
    getHelpCenterDomain,
    slugify,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {getLocaleSelectOptions} from 'pages/settings/helpCenter/utils/localeSelectOptions'
import {
    getParentCategories,
    getCategoriesById,
} from 'state/entities/helpCenter/categories'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getViewLanguage} from 'state/ui/helpCenter'

import {
    ActionType,
    ArticleLanguageSelect,
    OptionItem,
} from '../articles/ArticleLanguageSelect'
import {getCategoryDropdownOption} from '../articles/ArticleCategorySelect/hooks/useCategoriesOptions'
import {ConfirmationModal} from '../ConfirmationModal'
import {SearchEnginePreview} from '../SearchEnginePreview'
import {CloseModal} from '../articles/CloseModal'
import {eligibleParentCategories} from './utils'

import css from './HelpCenterCategoryEdit.less'

type Props = {
    isOpen: boolean
    isCreate?: boolean
    parentCategoryId?: number
    isLoading: boolean
    canSave: boolean
    helpCenter: HelpCenter
    category?: Category
    translation?: LocalCategoryTranslation
    onLocaleChange: (locale: LocaleCode) => void
    onCreate?: (payload: CreateCategoryDto) => void
    onSave?: (
        translation: UpdateCategoryTranslationDto,
        locale: LocaleCode
    ) => void
    onClose: () => void
    onDeleteTranslation: (categoryId: number, locale: LocaleCode) => void
    onDelete?: (categoryId: number) => void
}

export const HelpCenterCategoryEdit = ({
    isOpen,
    isCreate,
    parentCategoryId,
    isLoading,
    canSave,
    translation,
    category,
    helpCenter,
    onLocaleChange,
    onSave,
    onCreate,
    onClose,
    onDelete,
    onDeleteTranslation,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const locales = useSupportedLocales()
    const [title, setTitle] = useState('')
    const [parentCategory, setParentCategory] = useState<number | undefined>()
    const [slug, setSlug] = useState('')
    const [isPristineSlug, setPristineSlug] = useState(true)
    const [description, setDescription] = useState('')
    const [metaTitle, setMetaTitle] = useState<string | null>(null)
    const [metaDescription, setMetaDescription] = useState<string | null>(null)
    const [locale, setLocale] = useState(viewLanguage)
    const [pendingDeleteLocale, setPendingDeleteLocale] = useState<OptionItem>()
    const [pendingDeleteCategory, setPendingDeleteCategory] = useState(false)
    const categoryTitleRef = useRef<HTMLInputElement>(null)
    const screenSize = useScreenSize()
    const categories = useAppSelector(getParentCategories)
    const categoriesById = useAppSelector(getCategoriesById)
    const [isFirstOptionHidden, setIsFirstOptionHidden] = useState(false)
    const [isClearSelectionButtonHidden, setIsClearSelectionButtonHidden] =
        useState(false)
    const [parentOptions, setParentOptions] = useState<Option[]>([])
    const clearSelectionText = 'Clear selection'
    const categoryOptionCandidates = useMemo(
        () => eligibleParentCategories(categories, locale, category),
        [categories, locale, category]
    )
    const [hasPendingChanges, setHasPendingChanges] = useState(false)
    const [isAttemptingToClose, setIsAttemptingToClose] = useState(false)

    const domain = useMemo(() => getHelpCenterDomain(helpCenter), [helpCenter])

    const localeOptions = useMemo(
        () =>
            getLocaleSelectOptions(locales, helpCenter.supported_locales).map(
                (option) => {
                    let isComplete = false
                    let canBeDeleted = true

                    if (category?.available_locales) {
                        isComplete = category.available_locales.includes(
                            option.value
                        )
                        canBeDeleted = category.available_locales.length > 1
                    }

                    return {
                        ...option,
                        isComplete,
                        canBeDeleted,
                    }
                }
            ),
        [category, locales, helpCenter.supported_locales]
    )

    useEffect(() => {
        setLocale(viewLanguage)
    }, [viewLanguage])

    useEffect(() => {
        if (isOpen && category?.id) {
            setTitle(translation?.title || '')
            setSlug(translation?.slug || '')
            setDescription(translation?.description || '')
            setMetaTitle(translation?.seo_meta.title || null)
            setMetaDescription(translation?.seo_meta.description || null)
            setParentCategory(
                category.translation?.parent_category_id ?? undefined
            )

            if (translation?.locale) {
                setLocale(translation?.locale)
            }
        } else {
            setTitle('')
            setSlug('')
            setDescription('')
            setMetaTitle(null)
            setMetaDescription(null)
            setLocale(viewLanguage)
            setParentCategory(parentCategoryId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, category, translation, viewLanguage])

    // Only set the auto-focus after the drawer animation is finished
    // Otherwise it breaks the animation
    useEffect(() => {
        if (isOpen) {
            setTimeout(
                () => categoryTitleRef.current?.focus(),
                DRAWER_TRANSITION_DURATION_MS
            )
        }
    }, [isOpen])

    useEffect(() => {
        setParentOptions([
            ...categoryOptionCandidates.map((category) =>
                getCategoryDropdownOption(category)
            ),
            {
                value: 0,
                label: clearSelectionText,
            },
        ])
    }, [categoryOptionCandidates])

    const handleOnClickAction = (
        action: ActionType,
        currentOption: OptionItem
    ) => {
        if (action === 'delete' && category?.id) {
            setPendingDeleteLocale(currentOption)
        }
    }

    const handleOnConfirmDeleteCategory = () => {
        if (onDelete && category?.id) {
            setPendingDeleteCategory(false)
            onDelete(category.id)
        }
    }

    const handleOnChangeLocale = (localeCode: LocaleCode) => {
        setLocale(localeCode)
        onLocaleChange(localeCode)
    }

    const handleOnConfirmDelete = () => {
        if (category?.id && pendingDeleteLocale) {
            onDeleteTranslation(category.id, pendingDeleteLocale.value)
        }
        setPendingDeleteLocale(undefined)
        onClose()
    }

    const handleChangeTitle = (ev: ChangeEvent<HTMLInputElement>) => {
        setTitle(ev.target.value)

        if (isPristineSlug) {
            setSlug(slugify(ev.target.value))
        }

        setHasPendingChanges(true)
    }

    const handleChangeSlug = (ev: ChangeEvent<HTMLInputElement>) => {
        setSlug(slugify(ev.target.value))

        if (isPristineSlug) {
            setPristineSlug(false)
        }
        setHasPendingChanges(true)
    }

    const handleChangeDescription = (ev: ChangeEvent<HTMLInputElement>) => {
        setDescription(ev.target.value)
        setHasPendingChanges(true)
    }

    const handleChangeMetaTitle = (metaTitle: string | null) => {
        setMetaTitle(metaTitle)
        setHasPendingChanges(true)
    }

    const handleChangeMetaDescription = (metaDescription: string | null) => {
        setMetaDescription(metaDescription)
        setHasPendingChanges(true)
    }

    const handleOnSave = () => {
        setIsAttemptingToClose(false)
        setHasPendingChanges(false)

        if (isCreate) {
            onCreate?.({
                translation: {
                    locale,
                    title,
                    parent_category_id: parentCategory,
                    slug,
                    description,
                    seo_meta: {
                        title: metaTitle,
                        description: metaDescription,
                    },
                },
            })

            return
        }

        onSave?.(
            {
                title,
                slug,
                description,
                parent_category_id: parentCategory,
                seo_meta: {
                    title: metaTitle,
                    description: metaDescription,
                },
            },
            locale
        )
    }

    const handleDiscard = () => {
        onClose()
        setHasPendingChanges(false)
        setIsAttemptingToClose(false)
    }

    const handleCloseModalAttempt = () => {
        if (hasPendingChanges) {
            setIsAttemptingToClose(true)
        } else {
            onClose()
        }
    }

    const handleChangeParent = (categoryId: Value) => {
        setParentCategory(Number(categoryId))
        setHasPendingChanges(true)
    }
    const handleOnSearchChange = (text: string) => {
        setIsFirstOptionHidden(!!text)
        setIsClearSelectionButtonHidden(
            !!text &&
                clearSelectionText.toLowerCase().indexOf(text.toLowerCase()) >
                    -1
        )
    }

    const copyURL = () => {
        const categoryId = category?.id

        copy(getCategoryUrl({domain, locale, slug, categoryId}))

        void dispatch(
            notify({
                message: 'Link copied with success',
                status: NotificationStatus.Success,
            })
        )
    }

    const canSaveCategory = useMemo(
        () => canSave && title.trim() !== '' && slug.trim() !== '',
        [canSave, title, slug]
    )

    const slugPrefix = getCategoryUrl({domain, locale})
    const slugSuffix = category?.id ? `-${category.id.toString()}` : ''

    return (
        <Drawer
            name="category-edit"
            open={isOpen}
            fullscreen={screenSize === SCREEN_SIZE.SMALL}
            isLoading={isLoading}
            portalRootId="app-root"
            onBackdropClick={handleCloseModalAttempt}
            transitionDurationMs={DRAWER_TRANSITION_DURATION_MS}
        >
            <Drawer.Header>
                <h3>Category Settings</h3>
                <Drawer.HeaderActions>
                    <ArticleLanguageSelect
                        selected={locale}
                        list={localeOptions}
                        onSelect={handleOnChangeLocale}
                        onActionClick={handleOnClickAction}
                    />
                    <Button
                        data-testid="close-drawer"
                        aria-label="close modal"
                        className={css['close-btn']}
                        intent="secondary"
                        fillStyle="ghost"
                        onClick={onClose}
                    >
                        <ButtonIconLabel icon="keyboard_tab" />
                    </Button>
                </Drawer.HeaderActions>
            </Drawer.Header>
            <Drawer.Content>
                <div className={css.groupedFormGroups}>
                    <FormGroup
                        className={classNames(css.textfield, css.required)}
                    >
                        <Label for="title">Title</Label>
                        <Input
                            innerRef={categoryTitleRef}
                            data-testid="title-input"
                            name="title"
                            id="title"
                            value={title}
                            placeholder="Category title"
                            onChange={handleChangeTitle}
                            maxLength={HELP_CENTER_TITLE_MAX_LENGTH}
                        />
                    </FormGroup>
                    <FormGroup className={classNames(css.textfield)}>
                        <Label for="parentCategory">
                            <>Parent</>
                            <i
                                id="category-parent-toggle-info"
                                className={classNames(
                                    'material-icons',
                                    css.tooltipIcon
                                )}
                            >
                                info_outline
                            </i>
                            <Tooltip
                                placement="top-start"
                                target="category-parent-toggle-info"
                                popperClassName={css.tooltip}
                                innerClassName={css['tooltip-inner']}
                                arrowClassName={css['tooltip-arrow']}
                                boundariesElement="body"
                            >
                                Make this category a sub-category by adding a
                                parent.
                            </Tooltip>
                        </Label>
                        <SelectField
                            allowCustomValue
                            id="parentCategory"
                            dropdownMenuClassName={classNames(
                                css['parentDropdown'],
                                {
                                    [css['hideFirstOption']]:
                                        isFirstOptionHidden,
                                    [css['hideClearSelection']]:
                                        isClearSelectionButtonHidden,
                                }
                            )}
                            value={
                                parentCategory && categoriesById[parentCategory]
                                    ? categoriesById[parentCategory].translation
                                          ?.title
                                    : null
                            }
                            fullWidth
                            options={parentOptions}
                            placeholder="Category parent"
                            onChange={handleChangeParent}
                            onSearchChange={handleOnSearchChange}
                        />
                    </FormGroup>
                </div>
                <FormGroup className={classNames(css.textfield, css.required)}>
                    <div className={css.slugWrapper}>
                        <Label for="slug">Slug</Label>
                        <Button
                            fillStyle="ghost"
                            onClick={copyURL}
                            size="small"
                        >
                            <ButtonIconLabel icon="content_copy">
                                Copy URL
                            </ButtonIconLabel>
                        </Button>
                    </div>

                    <InputGroup>
                        <InputGroupAddon addonType="prepend">
                            <span
                                data-testid="slug-prefix"
                                className={css['slug-prefix']}
                            >
                                {slugPrefix}
                            </span>
                        </InputGroupAddon>
                        <Input
                            data-testid="slug-input"
                            name="slug"
                            id="slug"
                            value={slug}
                            placeholder="Category slug"
                            onChange={handleChangeSlug}
                        />
                        {slugSuffix && (
                            <InputGroupAddon addonType="append">
                                <span
                                    data-testid="slug-suffix"
                                    className={css['slug-suffix']}
                                >
                                    {slugSuffix}
                                </span>
                            </InputGroupAddon>
                        )}
                    </InputGroup>
                    <FormText>This is your category’s link.</FormText>
                </FormGroup>
                <FormGroup className={css.textfield}>
                    <Label for="description">Description</Label>
                    <Input
                        name="description"
                        id="description"
                        type="textarea"
                        placeholder="Category description"
                        value={description}
                        style={{
                            resize: 'vertical',
                            minHeight: 52,
                        }}
                        onChange={handleChangeDescription}
                        maxLength={HELP_CENTER_TITLE_MAX_LENGTH}
                    />
                    <FormText>
                        Category description is displayed in search engines to
                        help people find it.
                    </FormText>
                </FormGroup>
                <AutoPopulateInput
                    type="text"
                    name="seoTitle"
                    label="Meta Title"
                    value={metaTitle}
                    onChange={handleChangeMetaTitle}
                    populateLabel="Use the same as Title"
                    populateValue={title}
                    help="SEO Title tag is how your category is going to be displayed in Search Engines."
                    required
                />
                <AutoPopulateInput
                    type="textarea"
                    name="seoDescription"
                    label="Meta Description"
                    value={metaDescription}
                    onChange={handleChangeMetaDescription}
                    populateLabel="Use the same as Description"
                    populateValue={description}
                    help="Category description is displayed in search engines to help people find it."
                    rows="2"
                    required
                />
                <SearchEnginePreview
                    baseUrl={getAbsoluteUrl({domain}, false)}
                    title={metaTitle ?? title}
                    description={metaDescription ?? description}
                    urlItems={['articles', `${slug}${slugSuffix}`]}
                    help="This is a preview of how your category is going to look like in search engines (e.g. Google, Duckduckgo, Bing...)"
                />
            </Drawer.Content>
            <Drawer.Footer>
                <Button
                    data-testid="button-save"
                    isDisabled={!canSaveCategory}
                    onClick={handleOnSave}
                >
                    Save
                </Button>
                {category?.id && onDelete && (
                    <Button
                        className={css['delete-btn']}
                        intent="secondary"
                        onClick={() => setPendingDeleteCategory(true)}
                    >
                        <i className="material-icons mr-2">delete</i>
                        Delete Category
                    </Button>
                )}
            </Drawer.Footer>
            {pendingDeleteCategory && (
                <ConfirmationModal
                    isOpen={!!pendingDeleteCategory}
                    confirmText={`Delete category`}
                    title={
                        <span>
                            Are you sure you want to delete this category?
                        </span>
                    }
                    style={{width: '100%', maxWidth: 610}}
                    onClose={() => setPendingDeleteCategory(false)}
                    onConfirm={handleOnConfirmDeleteCategory}
                >
                    <span>
                        You will lose all content saved and published of this
                        category. You can’t undo this action, you’ll have to
                        compose again all the content for this category if you
                        decide to add it.
                    </span>
                </ConfirmationModal>
            )}
            {pendingDeleteLocale && (
                <ConfirmationModal
                    isOpen={!!pendingDeleteLocale}
                    confirmText={`Delete ${pendingDeleteLocale?.text}`}
                    title={
                        <span>
                            Are you sure you want to delete{' '}
                            {pendingDeleteLocale?.label} for this category?
                        </span>
                    }
                    style={{width: '100%', maxWidth: 610}}
                    onClose={() => setPendingDeleteLocale(undefined)}
                    onConfirm={handleOnConfirmDelete}
                >
                    <span>
                        You will lose all content saved and published of this
                        language ({pendingDeleteLocale?.label}) for this
                        category. You can’t undo this action, you’ll have to
                        compose again all the content for this language if you
                        decide to add it.
                    </span>
                </ConfirmationModal>
            )}
            <CloseModal
                isOpen={hasPendingChanges && isAttemptingToClose}
                title={<span>Are you sure?</span>}
                style={{width: '100%', maxWidth: 500}}
                saveText="Save category"
                editText="Edit category"
                discardText="Discard changes"
                onDiscard={handleDiscard}
                onContinueEditing={() => setIsAttemptingToClose(false)}
                onSave={handleOnSave}
            >
                <span>
                    If you close this category, you'll lose all changes made. Do
                    you want to save them?
                </span>
            </CloseModal>
        </Drawer>
    )
}
