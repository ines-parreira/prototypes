import type { ChangeEvent, RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { SCREEN_SIZE, useAsyncFn, useScreenSize } from '@repo/hooks'
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

import {
    Label as AxiomLabel,
    LegacyButton as Button,
    LegacyIconButton as IconButton,
    ListItem,
    Select,
    SelectTrigger,
    TextField,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type {
    Category,
    CreateCategoryDto,
    CustomerVisibility,
    HelpCenter,
    LocalCategoryTranslation,
    LocaleCode,
    UpdateCategoryTranslationDto,
} from 'models/helpCenter/types'
import { CustomerVisibilityEnum } from 'models/helpCenter/types'
import { Drawer } from 'pages/common/components/Drawer'
import AutoPopulateInput from 'pages/common/forms/AutoPopulateInput/AutoPopulateInput'
import {
    DRAWER_TRANSITION_DURATION_MS,
    HELP_CENTER_DEFAULT_LAYOUT,
    HELP_CENTER_DEFAULT_LOCALE,
    HELP_CENTER_TITLE_MAX_LENGTH,
} from 'pages/settings/helpCenter/constants'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import {
    getAbsoluteUrl,
    getCategoryUrl,
    getHelpCenterDomain,
    getHomePageItemHashUrl,
    slugify,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import { getLocaleSelectOptions } from 'pages/settings/helpCenter/utils/localeSelectOptions'
import {
    getCategoriesById,
    getParentCategories,
} from 'state/entities/helpCenter/categories'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getViewLanguage } from 'state/ui/helpCenter'

import type { FileUpload } from '../../hooks/useFileUpload'
import { useFileUpload } from '../../hooks/useFileUpload'
import { getCategoryDropdownOption } from '../articles/ArticleCategorySelect/hooks/useCategoriesOptions'
import type { CategoryOption } from '../articles/ArticleCategorySelect/hooks/useCategoriesOptions'
import type { ActionType, OptionItem } from '../articles/ArticleLanguageSelect'
import { ArticleLanguageSelect } from '../articles/ArticleLanguageSelect'
import { CloseModal } from '../articles/CloseModal'
import { ConfirmationModal } from '../ConfirmationModal'
import { SearchEnginePreview } from '../SearchEnginePreview'
import SelectCustomerVisibility from '../SelectVisibilityStatus/SelectVisibilityStatus'
import { CategoryImageEdit } from './components/CategoryImageEdit/CategoryImageEdit'
import { eligibleParentCategories, isOneOfParentsUnlisted } from './utils'

import css from './HelpCenterCategoryEdit.less'

const NO_PARENT_OPTION: CategoryOption = {
    id: 'no-parent',
    value: null,
    label: '- no parent -',
    textValue: '- no parent -',
}

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
        locale: LocaleCode,
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
    const [customerVisibility, setCustomerVisibility] =
        useState<CustomerVisibility>(CustomerVisibilityEnum.PUBLIC)
    const [slug, setSlug] = useState('')
    const [isPristineSlug, setPristineSlug] = useState(true)
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [metaTitle, setMetaTitle] = useState<string | null>(null)
    const [metaDescription, setMetaDescription] = useState<string | null>(null)
    const [pendingDeleteLocale, setPendingDeleteLocale] = useState<OptionItem>()
    const [pendingDeleteCategory, setPendingDeleteCategory] = useState(false)
    const [pendingSaveCategory, setPendingSaveCategory] = useState(false)
    const categoryTitleRef = useRef<HTMLInputElement>(null)
    const screenSize = useScreenSize()
    const categories = useAppSelector(getParentCategories)
    const categoriesById = useAppSelector(getCategoriesById)
    const categoryOptionCandidates = useMemo(
        () => eligibleParentCategories(categories, viewLanguage, category),
        [categories, viewLanguage, category],
    )
    const [hasPendingChanges, setHasPendingChanges] = useState(false)
    const [isAttemptingToClose, setIsAttemptingToClose] = useState(false)
    const [isAttemptingToDiscardChanges, setIsAttemptingToDiscardChanges] =
        useState(false)
    const hasDefaultLayout = helpCenter.layout === HELP_CENTER_DEFAULT_LAYOUT
    const imageFile = useFileUpload()
    /**
     * We check here few cases
     * - process the image as user uploaded image locally (by checking file.payload)
     * - The user can also "remove image"; in this case, file.payload will be empty but file.isTouched=true.
     * - and third case user didn't touch the field and we shouldn't provide any value to the server
     * */
    const getFileUploadURL = async (file: FileUpload) => {
        if (file.payload) {
            const uploadedFile = await file.uploadFile()

            return uploadedFile?.url
        } else if (file.isTouched) {
            return null
        }

        return undefined
    }

    useEffect(() => {
        // Discard to reset image state (isTouched and upload file) when the preview image changes.
        imageFile.discardFile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category?.translation?.image_url])

    const domain = useMemo(() => getHelpCenterDomain(helpCenter), [helpCenter])

    const [isParentUnlisted, setIsParentUnlisted] = useState(false)
    const [showNotification, setShowNotification] = useState(false)

    const articlesCount = category?.articleCount || 0

    const localeOptions = useMemo(
        () =>
            getLocaleSelectOptions(locales, helpCenter.supported_locales).map(
                (option) => {
                    let isComplete = false
                    let canBeDeleted = true

                    if (category?.available_locales) {
                        isComplete = category.available_locales.includes(
                            option.value,
                        )
                        canBeDeleted = category.available_locales.length > 1
                    }

                    return {
                        ...option,
                        isComplete,
                        canBeDeleted,
                    }
                },
            ),
        [category, locales, helpCenter.supported_locales],
    )

    useEffect(() => {
        if (
            isOpen &&
            category?.id &&
            category.translation?.locale === viewLanguage
        ) {
            setTitle(translation?.title || '')
            setSlug(translation?.slug || '')
            setDescription(translation?.description || '')
            setMetaTitle(translation?.seo_meta.title || null)
            setMetaDescription(translation?.seo_meta.description || null)
            setParentCategory(
                category.translation?.parent_category_id ?? undefined,
            )
            setImageUrl(category.translation?.image_url ?? '')
            if (category.translation) {
                setCustomerVisibility(
                    category.translation.customer_visibility ??
                        CustomerVisibilityEnum.PUBLIC,
                )
            }
        } else {
            setTitle('')
            setSlug('')
            setDescription('')
            setMetaTitle(null)
            setMetaDescription(null)
            setParentCategory(parentCategoryId)
            setCustomerVisibility(CustomerVisibilityEnum.PUBLIC)
            setImageUrl('')
        }
        setParentCategory(
            category?.translation?.parent_category_id ?? parentCategoryId,
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, category, translation, viewLanguage])

    // Only set the auto-focus after the drawer animation is finished
    // Otherwise it breaks the animation
    useEffect(() => {
        if (isOpen) {
            setTimeout(
                () => categoryTitleRef.current?.focus(),
                DRAWER_TRANSITION_DURATION_MS,
            )
        }
    }, [isOpen])

    const parentCategoryOptions = useMemo(
        () => [
            NO_PARENT_OPTION,
            ...categoryOptionCandidates.map((category) =>
                getCategoryDropdownOption(category, categoriesById),
            ),
        ],
        [categoryOptionCandidates, categoriesById],
    )

    const selectedParentOption = useMemo(
        () =>
            parentCategoryOptions.find(
                (opt) => opt.value === (parentCategory ?? null),
            ) ?? NO_PARENT_OPTION,
        [parentCategoryOptions, parentCategory],
    )

    useEffect(() => {
        if (parentCategory) {
            setIsParentUnlisted(
                isOneOfParentsUnlisted(categories, parentCategory),
            )
        } else {
            setIsParentUnlisted(false)
        }
    }, [parentCategory, categories])

    const handleOnClickAction = (
        action: ActionType,
        currentOption: OptionItem,
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
        onLocaleChange(localeCode)
    }

    const handleOnConfirmDelete = () => {
        if (category?.id && pendingDeleteLocale) {
            onDeleteTranslation(category.id, pendingDeleteLocale.value)
        }
        setPendingDeleteLocale(undefined)
        onClose()
    }

    const handleChangeImageFile = () => {
        setHasPendingChanges(true)
    }

    const handleRemoveImage = () => {
        setHasPendingChanges(true)
        setImageUrl('')
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

    const handleOnSave = async () => {
        setIsAttemptingToClose(false)
        setHasPendingChanges(false)
        setPendingSaveCategory(false)

        let categoryImageUrl: string | undefined | null = undefined
        try {
            categoryImageUrl = await getFileUploadURL(imageFile)
        } catch {
            void dispatch(
                notify({
                    message: 'Error during image upload',
                    status: NotificationStatus.Error,
                }),
            )
        }
        imageFile.discardFile()

        if (isCreate) {
            onCreate?.({
                translation: {
                    locale: viewLanguage,
                    image_url: categoryImageUrl,
                    title,
                    parent_category_id: parentCategory,
                    customer_visibility: customerVisibility,
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
                image_url: categoryImageUrl,
                parent_category_id: parentCategory,
                customer_visibility: customerVisibility,
                seo_meta: {
                    title: metaTitle,
                    description: metaDescription,
                },
            },
            viewLanguage,
        )
    }

    const [{ loading: isSaveProcessing }, attemptSave] =
        useAsyncFn(async () => {
            setIsAttemptingToClose(false)

            const hasChildren =
                articlesCount > 0 || (category && category.children.length > 0)
            if (
                !isCreate &&
                hasChildren &&
                category?.translation?.customer_visibility ===
                    CustomerVisibilityEnum.PUBLIC &&
                customerVisibility === CustomerVisibilityEnum.UNLISTED
            ) {
                setPendingSaveCategory(true)

                return
            }

            await handleOnSave()
        }, [
            category,
            customerVisibility,
            articlesCount,
            isCreate,
            handleOnSave,
        ])

    const handleDiscard = () => {
        onClose()
        setHasPendingChanges(false)
        setIsAttemptingToClose(false)
        setIsAttemptingToDiscardChanges(false)
        imageFile.discardFile()
    }

    const handleCloseModalAttempt = () => {
        if (hasPendingChanges) {
            setIsAttemptingToClose(true)
        } else {
            onClose()
        }
    }

    const handleDiscardChangesAttempt = () => {
        if (hasPendingChanges) {
            setIsAttemptingToDiscardChanges(true)
        } else {
            onClose()
        }
    }

    const handleVisibilityChange = (status: CustomerVisibility) => {
        setHasPendingChanges(true)
        setCustomerVisibility(status)
    }

    const handleChangeParent = (option: CategoryOption) => {
        const categoryId = option.value
        setParentCategory(categoryId ?? undefined)
        setHasPendingChanges(true)
        if (categoryId && isOneOfParentsUnlisted(categories, categoryId)) {
            setShowNotification(true)
        } else {
            setShowNotification(false)
        }
    }

    const onPreviewCategory = () => {
        if (!category?.translation) return

        const categoryId = category.id
        const unlistedId = category.translation.category_unlisted_id
        const isUnlisted =
            category.translation.customer_visibility ===
                CustomerVisibilityEnum.UNLISTED || isParentUnlisted

        const categoryUrl = hasDefaultLayout
            ? getCategoryUrl({
                  domain,
                  locale: viewLanguage,
                  slug,
                  categoryId,
                  unlistedId,
                  isUnlisted,
              })
            : getHomePageItemHashUrl({
                  itemType: 'category',
                  domain,
                  locale: viewLanguage,
                  itemId: categoryId,
                  isUnlisted,
              })

        window.open(categoryUrl, '_blank')?.focus()
    }

    const copyURL = () => {
        if (!category?.translation) return

        const categoryId = category.id
        const unlistedId = category.translation.category_unlisted_id
        const isUnlisted =
            category.translation.customer_visibility ===
                CustomerVisibilityEnum.UNLISTED || isParentUnlisted

        copy(
            hasDefaultLayout
                ? getCategoryUrl({
                      domain,
                      locale: viewLanguage,
                      slug,
                      categoryId,
                      unlistedId,
                      isUnlisted,
                  })
                : getHomePageItemHashUrl({
                      itemType: 'category',
                      domain,
                      locale: viewLanguage,
                      itemId: categoryId,
                      isUnlisted,
                  }),
        )

        void dispatch(
            notify({
                message: 'Link copied with success',
                status: NotificationStatus.Success,
            }),
        )
    }

    const canSaveCategory = useMemo(
        () => canSave && title.trim() !== '' && slug.trim() !== '',
        [canSave, title, slug],
    )

    const slugPrefix = getCategoryUrl({ domain, locale: viewLanguage })
    const slugSuffix = category?.id ? `-${category.id.toString()}` : ''

    const isUnlisted =
        (category?.translation &&
            category.translation.customer_visibility ===
                CustomerVisibilityEnum.UNLISTED) ||
        isParentUnlisted

    const showPreviewAndShareButton =
        !isCreate && (hasDefaultLayout || !isUnlisted)

    return (
        <Drawer
            aria-label="Category edit"
            open={isOpen}
            fullscreen={screenSize === SCREEN_SIZE.SMALL}
            isLoading={isLoading}
            portalRootId="app-root"
            onBackdropClick={handleCloseModalAttempt}
            transitionDurationMs={DRAWER_TRANSITION_DURATION_MS}
            className={css.drawer}
        >
            <Drawer.Header className={css.header}>
                <div className={css.headerTop}>
                    <h3 className={css.headerTitle}>Category Settings</h3>
                    <Drawer.HeaderActions
                        onClose={handleCloseModalAttempt}
                        closeButtonId="close-button"
                    >
                        {showPreviewAndShareButton && (
                            <>
                                <IconButton
                                    icon="open_in_new"
                                    onClick={onPreviewCategory}
                                    fillStyle="ghost"
                                    intent="secondary"
                                    size="medium"
                                    aria-label="preview category"
                                />
                                <IconButton
                                    icon="share"
                                    onClick={copyURL}
                                    fillStyle="ghost"
                                    intent="secondary"
                                    size="medium"
                                    aria-label="copy url"
                                />
                            </>
                        )}
                    </Drawer.HeaderActions>
                </div>
                <div className={css.headerActions}>
                    {hasDefaultLayout && (
                        <div>
                            <AxiomLabel>Category parent</AxiomLabel>
                            <Select<CategoryOption>
                                trigger={({ ref, selectedText, isOpen }) => (
                                    <SelectTrigger>
                                        <TextField
                                            inputRef={
                                                ref as RefObject<HTMLInputElement>
                                            }
                                            value={selectedText}
                                            isFocused={isOpen}
                                            trailingSlot={
                                                isOpen
                                                    ? 'arrow-chevron-up'
                                                    : 'arrow-chevron-down'
                                            }
                                        />
                                    </SelectTrigger>
                                )}
                                items={parentCategoryOptions}
                                selectedItem={selectedParentOption}
                                onSelect={handleChangeParent}
                                aria-label="Parent category"
                                isSearchable={parentCategoryOptions.length > 1}
                                maxWidth={266}
                            >
                                {(option: CategoryOption) => (
                                    <ListItem
                                        id={option.id}
                                        label={option.textValue}
                                        textValue={option.textValue}
                                    />
                                )}
                            </Select>
                        </div>
                    )}
                    <SelectCustomerVisibility
                        onChange={handleVisibilityChange}
                        status={customerVisibility}
                        className={css.visibilitySelect}
                        isParentUnlisted={isParentUnlisted}
                        showNotification={showNotification}
                        setShowNotification={setShowNotification}
                        type="category"
                    />
                </div>
            </Drawer.Header>
            <Drawer.Content>
                {hasDefaultLayout && (
                    <div
                        className={css.groupedFormGroups}
                        data-testid="image-upload"
                    >
                        <FormGroup>
                            <CategoryImageEdit
                                onImageChanged={handleChangeImageFile}
                                currentImageUrl={imageUrl}
                                imageFile={imageFile}
                                onRemoveImage={handleRemoveImage}
                            />
                        </FormGroup>
                    </div>
                )}
                <div className={css.groupedFormGroups}>
                    <FormGroup className={classNames(css.languageSelect)}>
                        <Label for="title">Language</Label>
                        <ArticleLanguageSelect
                            selected={viewLanguage}
                            list={localeOptions}
                            onSelect={handleOnChangeLocale}
                            onActionClick={handleOnClickAction}
                            className={classNames(
                                css.inlineLanguageSelect,
                                css.inlineLanguageSelectForm,
                            )}
                        />
                    </FormGroup>
                </div>
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
                </div>
                <FormGroup className={classNames(css.textfield, css.required)}>
                    <div className={css.slugWrapper}>
                        <Label for="slug">Slug</Label>
                        <Button
                            fillStyle="ghost"
                            onClick={copyURL}
                            size="small"
                            leadingIcon="content_copy"
                        >
                            Copy URL
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
                            disabled={!hasDefaultLayout}
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
                    <FormText>Category link.</FormText>
                </FormGroup>
                {hasDefaultLayout && (
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
                        <FormText>Category description (optional)</FormText>
                    </FormGroup>
                )}
                {hasDefaultLayout && (
                    <>
                        <AutoPopulateInput
                            type="text"
                            name="seoTitle"
                            label="Meta Title"
                            value={metaTitle}
                            onChange={handleChangeMetaTitle}
                            populateLabel="Use the same as Title"
                            populateValue={title}
                            help="Category title displayed in search engine results."
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
                            help="Category description displayed in search engines results."
                            rows="2"
                            required
                        />
                        <SearchEnginePreview
                            baseUrl={getAbsoluteUrl({ domain }, false)}
                            title={metaTitle ?? title}
                            description={metaDescription ?? description}
                            urlItems={['articles', `${slug}${slugSuffix}`]}
                            help="Category preview in search engine results."
                        />
                    </>
                )}
            </Drawer.Content>
            <Drawer.Footer className={css.footer}>
                <Button
                    data-testid="button-save"
                    isDisabled={!canSaveCategory}
                    onClick={attemptSave}
                    isLoading={isSaveProcessing}
                >
                    {isCreate ? 'Create Category' : 'Save'}
                </Button>
                <Button
                    intent="secondary"
                    onClick={handleDiscardChangesAttempt}
                >
                    Discard Changes
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
                    style={{ width: '100%', maxWidth: 610 }}
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
            {pendingSaveCategory && !isCreate && (
                <div className={css.confirmSaveUnlisted}>
                    <div className={css.confirmSaveUnlistedHeader}>
                        <span>Unlist category and its content</span>
                        <IconButton
                            icon="close"
                            onClick={() => setPendingSaveCategory(false)}
                            fillStyle="ghost"
                            intent="secondary"
                            size="medium"
                            aria-label="cancel save category"
                        />
                    </div>
                    <div className={css.confirmSaveUnlistedContent}>
                        Unlisting this category will make all its public
                        subcategories and articles accessible via direct link
                        only.
                        <div className={css.confirmSaveUnlistedButtons}>
                            <Button onClick={handleOnSave} size="small">
                                Confirm
                            </Button>
                            <Button
                                onClick={() => setPendingSaveCategory(false)}
                                intent="secondary"
                                size="small"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
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
                    style={{ width: '100%', maxWidth: 610 }}
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
            {hasPendingChanges && isAttemptingToDiscardChanges && (
                <CloseModal
                    isOpen={hasPendingChanges && isAttemptingToDiscardChanges}
                    title={<span>Quit without saving?</span>}
                    saveText="Save Changes"
                    editText="Back to editing"
                    discardText="Discard Changes"
                    onDiscard={handleDiscard}
                    onContinueEditing={() =>
                        setIsAttemptingToDiscardChanges(false)
                    }
                    onSave={attemptSave}
                >
                    <span>
                        By discarding changes, you will lose all progress made
                        editing. Are you sure you want to proceed?
                    </span>
                </CloseModal>
            )}
            <CloseModal
                isOpen={hasPendingChanges && isAttemptingToClose}
                title={<span>Unsaved changes</span>}
                saveText="Save"
                editText="Back to editing"
                discardText="Don't save"
                onDiscard={handleDiscard}
                onContinueEditing={() => setIsAttemptingToClose(false)}
                onSave={attemptSave}
            >
                <span>
                    {`Do you want to save the changes made to this category? All
                    changes will be lost if you don't save them.`}
                </span>
            </CloseModal>
        </Drawer>
    )
}
