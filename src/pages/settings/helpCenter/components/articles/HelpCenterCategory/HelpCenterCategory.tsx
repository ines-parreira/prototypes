import React, {
    ChangeEvent,
    MouseEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {useSelector} from 'react-redux'
import classNames from 'classnames'
import {
    Button,
    FormGroup,
    FormText,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
} from 'reactstrap'
import copy from 'copy-to-clipboard'

import useAppDispatch from '../../../../../../hooks/useAppDispatch'
import {NotificationStatus} from '../../../../../../state/notifications/types'
import {notify} from '../../../../../../state/notifications/actions'
import {SCREEN_SIZE, useScreenSize} from '../../../../../../hooks/useScreenSize'

import {
    Category,
    CategoryTranslation,
    CreateCategoryDto,
    HelpCenter,
    LocaleCode,
} from '../../../../../../models/helpCenter/types'
import {getViewLanguage} from '../../../../../../state/helpCenter/ui'

import {Drawer} from '../../../../../common/components/Drawer'
import {
    DRAWER_TRANSITION_DURATION_MS,
    HELP_CENTER_LANGUAGE_DEFAULT,
} from '../../../constants'
import {useLocales} from '../../../hooks/useLocales'
import {useLocaleSelectOptions} from '../../../hooks/useLocaleSelectOptions'
import {
    buildCategorySlug,
    getHelpCenterDomain,
    slugify,
} from '../../../utils/helpCenter.utils'
import {ConfirmationModal} from '../../ConfirmationModal'
import {
    ActionType,
    ArticleLanguageSelect,
    OptionItem,
} from '../ArticleLanguageSelect'

import css from './HelpCenterCategory.less'

type Props = {
    isOpen: boolean
    isCreate?: boolean
    isLoading: boolean
    canSave: boolean
    helpCenter: HelpCenter
    customDomain?: string
    category?: Category
    translation?: CategoryTranslation
    onLocaleChange: (locale: LocaleCode) => void
    onCreate?: (payload: CreateCategoryDto) => void
    onSave?: (payload: Partial<CategoryTranslation>, locale: LocaleCode) => void
    onClose: () => void
    onDeleteTranslation: (categoryId: number, locale: LocaleCode) => void
    onDelete?: (categoryId: number) => void
}

export const HelpCenterCategory = ({
    isOpen,
    isCreate,
    isLoading,
    canSave,
    translation,
    category,
    helpCenter,
    customDomain,
    onLocaleChange,
    onSave,
    onCreate,
    onClose,
    onDelete,
    onDeleteTranslation,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_LANGUAGE_DEFAULT
    const locales = useLocales()
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [isPristineSlug, setPristineSlug] = useState(true)
    const [description, setDescription] = useState('')
    const [locale, setLocale] = useState(viewLanguage)
    const [pendingDeleteLocale, setPendingDeleteLocale] = useState<OptionItem>()
    const [pendingDeleteCategory, setPendingDeleteCategory] = useState(false)
    const categoryTitleRef = useRef<HTMLInputElement>(null)
    const screenSize = useScreenSize()

    const localeOptions = useLocaleSelectOptions(
        locales,
        helpCenter.supported_locales || []
    )

    const domain = useMemo(
        () => getHelpCenterDomain(helpCenter.subdomain, customDomain),
        [customDomain, helpCenter.subdomain]
    )

    const options: OptionItem[] = useMemo(
        () =>
            localeOptions.map((option) => {
                let isComplete = false
                let canBeDeleted = true

                if (category?.available_locales) {
                    isComplete = category.available_locales.includes(
                        option.value
                    )
                    canBeDeleted = category?.available_locales?.length > 1
                }

                return {
                    ...option,
                    isComplete,
                    canBeDeleted,
                }
            }),
        [category, localeOptions]
    )

    useEffect(() => {
        setLocale(viewLanguage)
    }, [viewLanguage])

    useEffect(() => {
        if (isOpen && category?.id) {
            setTitle(translation?.title || '')
            setSlug(translation?.slug || '')
            setDescription(translation?.description || '')
            if (translation?.locale) {
                setLocale(translation?.locale)
            }
        } else {
            setTitle('')
            setSlug('')
            setDescription('')
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
        ev: MouseEvent,
        action: ActionType,
        currentOption: OptionItem
    ) => {
        if (action === 'delete' && category?.id) {
            ev.stopPropagation()
            setPendingDeleteLocale(currentOption)
        }
    }

    const handleOnConfirmDeleteCategory = () => {
        if (onDelete && category?.id) {
            setPendingDeleteCategory(false)
            onDelete(category.id)
        }
    }

    const handleOnChangeLocale = (ev: MouseEvent, value: LocaleCode) => {
        setLocale(value)
        onLocaleChange(value)
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
                translation: {
                    title,
                    slug,
                    description,
                    locale,
                },
            })

            return
        }

        onSave?.(
            {
                title,
                slug,
                description,
            },
            locale
        )
    }

    const copyURL = () => {
        const categoryId = category?.id

        copy(buildCategorySlug({domain, locale, slug, categoryId}))

        void dispatch(
            notify({
                message: 'Successfully copied the link',
                status: NotificationStatus.Success,
            })
        )
    }

    const canSaveCategory = useMemo(
        () => canSave && title.trim() !== '' && slug.trim() !== '',
        [canSave, title, slug]
    )

    const content = () => (
        <>
            <Drawer.Header>
                <span className={css.title}>Category Settings</span>
                <Drawer.HeaderActions>
                    <ArticleLanguageSelect
                        selected={locale}
                        list={options}
                        onSelect={handleOnChangeLocale}
                        onClickAction={handleOnClickAction}
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
                    />
                </FormGroup>
                <FormGroup className={classNames(css.textfield, css.required)}>
                    <Label for="slug">Slug</Label>
                    <button
                        type="button"
                        onClick={copyURL}
                        className={css.copyButton}
                    >
                        Copy URL
                        <i className="material-icons">content_copy</i>
                    </button>
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">
                            <span
                                data-testid="slug-prefix"
                                className={css['slug-prefix']}
                            >
                                {buildCategorySlug({domain, locale})}
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
                        {category?.id && (
                            <InputGroupAddon addonType="append">
                                <span
                                    data-testid="slug-suffix"
                                    className={css['slug-suffix']}
                                >
                                    -{category.id}
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
                    />
                    <FormText>
                        Category description is displayed in search engines to
                        help people find it.
                    </FormText>
                </FormGroup>
            </Drawer.Content>
            <Drawer.Footer>
                <Button
                    data-testid="button-save"
                    color="primary"
                    disabled={!canSaveCategory}
                    onClick={handleOnSave}
                >
                    Save
                </Button>
                {category?.id && onDelete && (
                    <Button
                        className={css['delete-btn']}
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
