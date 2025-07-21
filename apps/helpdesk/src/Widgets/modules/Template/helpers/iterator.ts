import {
    CardTemplate,
    isSourceRecord,
    ListTemplate,
    Source,
    Template,
    WrapperTemplate,
} from 'models/widget/types'

/**
 * Unfold next iteration of template and source
 */
export function seekNextValues(
    parentTemplate: WrapperTemplate | ListTemplate | CardTemplate,
    parentSource: Source,
    templateIndex = 0,
): {
    parentTemplate: Template
    template: Template | null
    source: Source
} {
    const template = seekNextTemplate(parentTemplate, templateIndex)
    if (!template) {
        return {
            parentTemplate,
            template: null,
            source: parentSource,
        }
    }
    const source = seekNextSource(parentSource, template.path)

    return {
        parentTemplate,
        template,
        source,
    }
}

function seekNextTemplate(
    parentTemplate: WrapperTemplate | ListTemplate | CardTemplate,
    templateIndex: number,
) {
    const template = parentTemplate.widgets?.[templateIndex]
    if (!template) {
        return null
    }

    return {
        ...template,
        templatePath: `${
            parentTemplate.templatePath || ''
        }.widgets.${templateIndex}`,
        absolutePath: buildAbsolutePath(parentTemplate, template),
    }
}

function seekNextSource(
    parentSource: Source,
    path: string | undefined,
): Source {
    return path && isSourceRecord(parentSource)
        ? parentSource[path]
        : parentSource
}

function buildAbsolutePath(
    parentTemplate: WrapperTemplate | ListTemplate | CardTemplate,
    template: Template,
) {
    const absolutePath = [...(parentTemplate?.absolutePath || [])]
    if (parentTemplate.type === 'list') {
        absolutePath.push('[]')
    }
    if (template.path) {
        absolutePath.push(template.path)
    }
    return absolutePath
}
