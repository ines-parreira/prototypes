import React from 'react'
import classNames from 'classnames'
import {useSelector} from 'react-redux'

import {
    Input,
    Label,
    Button,
    FormGroup,
    FormText,
    InputGroupAddon,
    InputGroup,
} from 'reactstrap'

import {
    HelpCenter,
    CategoryTranslation,
    LocaleCode,
    CreateCategoryDto,
    Category,
} from '../../../../../../models/helpCenter/types'
import {readViewLanguage} from '../../../../../../state/helpCenter/ui'

import {Drawer} from '../../../../../common/components/Drawer'

import {useLocales} from '../../../hooks/useLocales'
import {useLocaleSelectOptions} from '../../../hooks/useLocaleSelectOptions'

import {
    HELP_CENTER_DOMAIN,
    HELP_CENTER_LANGUAGE_DEFAULT,
} from '../../../constants'
import {slugify} from '../../../utils/helpCenter.utils'
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
    helpCenter: HelpCenter | null
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
    const viewLanguage =
        useSelector(readViewLanguage) || HELP_CENTER_LANGUAGE_DEFAULT
    const locales = useLocales()
    const [title, setTitle] = React.useState('')
    const [slug, setSlug] = React.useState('')
    const [isPristineSlug, setPristineSlug] = React.useState(true)
    const [description, setDescription] = React.useState('')
    const [currentLocale, setCurrentLocale] = React.useState(viewLanguage)
    const [pendingDeleteLocale, setPendingDeleteLocale] = React.useState<
        OptionItem
    >()
    const [pendingDeleteCategory, setPendingDeleteCategory] = React.useState(
        false
    )

    const localeOptions = useLocaleSelectOptions(
        locales,
        helpCenter?.supported_locales || []
    )

    const options: OptionItem[] = React.useMemo(
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

    React.useEffect(() => {
        setCurrentLocale(viewLanguage)
    }, [viewLanguage])

    React.useEffect(() => {
        if (isOpen && category?.id) {
            setTitle(translation?.title || '')
            setSlug(translation?.slug || '')
            setDescription(translation?.description || '')
            if (translation?.locale) {
                setCurrentLocale(translation?.locale)
            }
        } else {
            setTitle('')
            setSlug('')
            setDescription('')
            setCurrentLocale(viewLanguage)
        }
    }, [isOpen, category, translation, viewLanguage])

    const handleOnClickAction = (
        ev: React.MouseEvent,
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

    const handleOnChangeLocale = (ev: React.MouseEvent, value: LocaleCode) => {
        setCurrentLocale(value)
        onLocaleChange(value)
    }

    const handleOnConfirmDelete = () => {
        if (category?.id && pendingDeleteLocale) {
            onDeleteTranslation(category.id, pendingDeleteLocale.value)
        }
        setPendingDeleteLocale(undefined)
        onClose()
    }

    const handleChangeTitle = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(ev.target.value)

        if (isPristineSlug) {
            setSlug(slugify(ev.target.value))
        }
    }

    const handleChangeSlug = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(slugify(ev.target.value))

        if (isPristineSlug) {
            setPristineSlug(false)
        }
    }

    const handleChangeDescription = (
        ev: React.ChangeEvent<HTMLInputElement>
    ) => {
        setDescription(ev.target.value)
    }

    const handleOnSave = () => {
        if (isCreate) {
            onCreate &&
                onCreate({
                    translation: {
                        title,
                        slug,
                        description,
                        locale: currentLocale,
                    },
                })
            return
        }
        onSave &&
            onSave(
                {
                    title,
                    slug,
                    description,
                },
                currentLocale
            )
    }

    const slugValue: string = String(currentLocale).toLowerCase()

    const content = () => (
        <>
            <Drawer.Header>
                <span className={css.title}>Category Settings</span>
                <Drawer.HeaderActions>
                    <ArticleLanguageSelect
                        selected={currentLocale}
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
                        data-testid="title-input"
                        autoFocus
                        name="title"
                        id="title"
                        value={title}
                        placeholder="Category title"
                        onChange={handleChangeTitle}
                    />
                </FormGroup>
                <FormGroup className={classNames(css.textfield, css.required)}>
                    <Label for="slug">Slug</Label>
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">
                            <span
                                data-testid="slug-domain"
                                className={css['slug-domain']}
                            >
                                {`https://${
                                    helpCenter?.subdomain as string
                                }.${HELP_CENTER_DOMAIN}/${slugValue}`}
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
                    </InputGroup>
                    <FormText>This is your category’s link.</FormText>
                </FormGroup>
                <FormGroup className={classNames(css.textfield, css.required)}>
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
                    disabled={Boolean(
                        title.trim() === '' ||
                            slug.trim() === '' ||
                            description.trim() === ''
                    )}
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
            fullscreen={false}
            isLoading={isLoading}
            portalRootId="app-root"
            onBackdropClick={onClose}
        >
            {isOpen && content()}
        </Drawer>
    )
}
