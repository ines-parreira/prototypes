import React, {ChangeEvent, useEffect, useMemo, useRef, useState} from 'react'
import classNames from 'classnames'
import copy from 'copy-to-clipboard'
import {useSelector} from 'react-redux'
import {
    FormGroup,
    FormText,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
} from 'reactstrap'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {SCREEN_SIZE, useScreenSize} from '../../../../../hooks/useScreenSize'
import {
    Category,
    CreateCategoryTranslationDto,
    HelpCenter,
    LocalCategoryTranslation,
    LocaleCode,
    UpdateCategoryTranslationDto,
} from '../../../../../models/helpCenter/types'
import {getViewLanguage} from '../../../../../state/helpCenter/ui'
import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {Drawer} from '../../../../common/components/Drawer'
import AutoPopulateInput from '../../../../common/forms/AutoPopulateInput/AutoPopulateInput'
import {
    DRAWER_TRANSITION_DURATION_MS,
    HELP_CENTER_DEFAULT_LOCALE,
    HELP_CENTER_TITLE_MAX_LENGTH,
} from '../../constants'
import {useSupportedLocales} from '../../providers/SupportedLocales'
import {
    getAbsoluteUrl,
    getCategoryUrl,
    getHelpCenterDomain,
    slugify,
} from '../../utils/helpCenter.utils'
import {getLocaleSelectOptions} from '../../utils/localeSelectOptions'
import {ConfirmationModal} from '../ConfirmationModal'
import {SearchEnginePreview} from '../SearchEnginePreview'
import {
    ActionType,
    ArticleLanguageSelect,
    OptionItem,
} from '../articles/ArticleLanguageSelect'

import css from './HelpCenterCategoryEdit.less'

type Props = {
    isOpen: boolean
    isCreate?: boolean
    isLoading: boolean
    canSave: boolean
    helpCenter: HelpCenter
    category?: Category
    translation?: LocalCategoryTranslation
    onLocaleChange: (locale: LocaleCode) => void
    onCreate?: (translation: CreateCategoryTranslationDto) => void
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
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const locales = useSupportedLocales()
    const [title, setTitle] = useState('')
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
        }
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
    }

    const handleChangeSlug = (ev: ChangeEvent<HTMLInputElement>) => {
        setSlug(slugify(ev.target.value))

        if (isPristineSlug) {
            setPristineSlug(false)
        }
    }

    const handleChangeDescription = (ev: ChangeEvent<HTMLInputElement>) => {
        setDescription(ev.target.value)
    }

    const handleOnSave = () => {
        if (isCreate) {
            onCreate?.({
                locale,
                title,
                slug,
                description,
                seo_meta: {
                    title: metaTitle,
                    description: metaDescription,
                },
            })

            return
        }

        onSave?.(
            {
                title,
                slug,
                description,
                seo_meta: {
                    title: metaTitle,
                    description: metaDescription,
                },
            },
            locale
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

    const content = () => (
        <>
            <Drawer.Header>
                <h3>Category Settings</h3>
                <Drawer.HeaderActions>
                    <ArticleLanguageSelect
                        selected={locale}
                        list={localeOptions}
                        onSelect={handleOnChangeLocale}
                        onActionClick={handleOnClickAction}
                    />
                    <button
                        type="button"
                        data-testid="close-drawer"
                        aria-label="close modal"
                        className={css['close-btn']}
                        onClick={onClose}
                    >
                        <i className="material-icons">keyboard_tab</i>
                    </button>
                </Drawer.HeaderActions>
            </Drawer.Header>
            <Drawer.Content>
                <FormGroup className={classNames(css.textfield, css.required)}>
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
                <FormGroup className={classNames(css.textfield, css.required)}>
                    <Label for="slug">Slug</Label>
                    <Button
                        intent={ButtonIntent.Text}
                        type="button"
                        onClick={copyURL}
                        className={css.copyButton}
                    >
                        Copy URL
                        <i className="material-icons">content_copy</i>
                    </Button>
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
                    onChange={setMetaTitle}
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
                    onChange={setMetaDescription}
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
                    intent={ButtonIntent.Primary}
                    isDisabled={!canSaveCategory}
                    onClick={handleOnSave}
                >
                    Save
                </Button>
                {category?.id && onDelete && (
                    <Button
                        className={css['delete-btn']}
                        intent={ButtonIntent.Secondary}
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
        </>
    )

    return (
        <Drawer
            name="category-edit"
            open={isOpen}
            fullscreen={screenSize === SCREEN_SIZE.SMALL}
            isLoading={isLoading}
            portalRootId="app-root"
            onBackdropClick={onClose}
            transitionDurationMs={DRAWER_TRANSITION_DURATION_MS}
        >
            {content()}
        </Drawer>
    )
}
