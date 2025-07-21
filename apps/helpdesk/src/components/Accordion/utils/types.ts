export type AccordionValue = string | number
export type AccordionValues = AccordionValue[]

export type AccordionValueProps = {
    value?: AccordionValues
    onValueChange?: (value: AccordionValues) => void
}

export type AccordionProps = AccordionValueProps & {
    /**
     * Use the multiple prop to allow multiple panels to be expanded simultaneously.
     * @default true
     */
    multiple?: boolean
    id?: string
    /**
     * Use the disabled prop to disable the accordion entirely.
     * @default false
     */
    disabled?: boolean
    children: React.ReactNode
}
