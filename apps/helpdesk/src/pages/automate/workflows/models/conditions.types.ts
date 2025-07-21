export type VarSchema = {
    var: string
}

export type IntervalUnit = 'd' | 'h' | 'm' | 'w'
export type IntervalSign = '+' | '-'

type BaseConditionSchema = {
    equals?: never
    notEqual?: never
    contains?: never
    doesNotContain?: never
    endsWith?: never
    startsWith?: never
    exists?: never
    doesNotExist?: never
    lessThan?: never
    lessThanInterval?: never
    greaterThanInterval?: never
    lessOrEqual?: never
    greaterThan?: never
    greaterOrEqual?: never
}

export type EqualsSchema<
    T extends string | number | boolean = string | number | boolean,
> = Omit<BaseConditionSchema, 'equals'> & {
    equals: [VarSchema, T | null | undefined]
}

export type NotEqualSchema = Omit<BaseConditionSchema, 'notEqual'> & {
    notEqual: [VarSchema, string | number | boolean | null | undefined]
}

export type ContainsSchema = Omit<BaseConditionSchema, 'contains'> & {
    contains: [VarSchema, string | null | undefined]
}

export type DoesNotContainSchema = Omit<
    BaseConditionSchema,
    'doesNotContain'
> & {
    doesNotContain: [VarSchema, string | null | undefined]
}

export type EndsWithSchema = Omit<BaseConditionSchema, 'endsWith'> & {
    endsWith: [VarSchema, string | null | undefined]
}

export type StartsWithSchema = Omit<BaseConditionSchema, 'startsWith'> & {
    startsWith: [VarSchema, string | null | undefined]
}

export type ExistsSchema = Omit<BaseConditionSchema, 'exists'> & {
    exists: [VarSchema]
}

export type DoesNotExistSchema = Omit<BaseConditionSchema, 'doesNotExist'> & {
    doesNotExist: [VarSchema]
}

export type LessThanSchema<T extends number | string = number | string> = Omit<
    BaseConditionSchema,
    'lessThan'
> & {
    lessThan: [VarSchema, T | null | undefined]
}

export type LessThanInterval = Omit<BaseConditionSchema, 'lessThanInterval'> & {
    lessThanInterval: [
        VarSchema,
        `${IntervalSign}${number}${IntervalUnit}` | null | undefined,
    ]
}

export type GreaterThanInterval = Omit<
    BaseConditionSchema,
    'greaterThanInterval'
> & {
    greaterThanInterval: [
        VarSchema,
        `${IntervalSign}${number}${IntervalUnit}` | null | undefined,
    ]
}

export type LessOrEqualSchema = Omit<BaseConditionSchema, 'lessOrEqual'> & {
    lessOrEqual: [VarSchema, number | null | undefined]
}

export type GreaterThanSchema<T extends number | string = number | string> =
    Omit<BaseConditionSchema, 'greaterThan'> & {
        greaterThan: [VarSchema, T | null | undefined]
    }

export type GreaterOrEqualSchema = Omit<
    BaseConditionSchema,
    'greaterOrEqual'
> & {
    greaterOrEqual: [VarSchema, number | null | undefined]
}

export type BooleanSchema =
    | EqualsSchema<boolean>
    | ExistsSchema
    | DoesNotExistSchema

export type StringSchema =
    | EqualsSchema<string>
    | NotEqualSchema
    | ContainsSchema
    | DoesNotContainSchema
    | EndsWithSchema
    | StartsWithSchema
    | ExistsSchema
    | DoesNotExistSchema

export type NumberSchema =
    | EqualsSchema<number>
    | NotEqualSchema
    | ExistsSchema
    | DoesNotExistSchema
    | LessThanSchema<number>
    | LessOrEqualSchema
    | GreaterThanSchema<number>
    | GreaterOrEqualSchema

export type DateSchema =
    | ExistsSchema
    | DoesNotExistSchema
    | LessThanSchema<string>
    | GreaterThanSchema<string>
    | LessThanInterval
    | GreaterThanInterval

export type ConditionSchema =
    | EqualsSchema
    | NotEqualSchema
    | ContainsSchema
    | DoesNotContainSchema
    | EndsWithSchema
    | StartsWithSchema
    | ExistsSchema
    | DoesNotExistSchema
    | LessThanSchema
    | LessOrEqualSchema
    | GreaterThanSchema
    | GreaterOrEqualSchema
    | LessThanInterval
    | GreaterThanInterval

export type ConditionKey = keyof ConditionSchema

export type ConditionsSchema =
    | {
          or: ConditionSchema[]
          and?: never
      }
    | {
          and: ConditionSchema[]
          or?: never
      }
