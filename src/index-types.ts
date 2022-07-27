import {FuncLike, FuncOrName, ObjectLike, RecLike} from "@leyyo/core";
import {Target} from "./index-enums";

// region deco

/**
 * Mixing type for Decorator Id
 *
 * @mixes {FuncLike|DecoIdLike}
 * */
export type FuncOrDecoId = FuncLike | DecoIdLike;

/**
 * Decorator function type
 * - identifier: a real decorator function
 * - alias: it is decorator a function, but it should be bound to another identifier decorator function
 *
 * @internal
 * */
export type DecoIdType = 'identifier' | 'alias';
/**
 * Decorator property keyword type
 * - static: static property
 * - instance: instance property
 *
 * @internal
 * */
export type DecoKeyword = 'static' | 'instance';
/**
 * Decorator property type
 * - field: field property so type is not a function
 * - method: method property so type is a function
 *
 * @internal
 * */
export type DecoKind = 'field' | 'method';

/**
 * Decorator scope type
 * - owned: filter for only owned properties for class
 * - inherited: filter for only inherited properties for class
 * @internal
 * */
export type DecoScope = 'owned' | 'inherited';

/**
 * Decorator belongs type
 * - self: filter for only self values of any-reflection
 * - parent: filter for only parent values of any-reflection
 * - all or any value
 * @internal
 * */
export type DecoBelongs = 'self' | 'parent';

export interface DecoFilterBelongs {
    /**
     * If self, it searches in self values
     * If parent, it searches in parent values
     * @see {@link DecoBelongs}
     * */
    /**
     * If true, it returns only owned values[decorators], else with inherited values
     * */
    belongs?: DecoBelongs;
}
export interface DecoFilterScope {
    /**
     * - owned: filter for only owned properties for class
     * - inherited: filter for only inherited properties for class
     * */
    scope?: DecoScope;
}
export interface DecoFilterKeyword {
    /**
     * If static, it searches in only static properties
     * If instance, it searches in only instance properties
     * @see {@link DecoKeyword}
     * */
    keyword?: DecoKeyword;
}
export interface DecoFilterKind {
    /**
     * If field, it searches in only field properties
     * If method, it searches in only method properties
     * @see {@link DecoKind}
     * */
    kind?: DecoKind;
}
/**
 * Decorator and reflection filter options
 * */
export type DecoFilter = DecoFilterBelongs & DecoFilterScope & DecoFilterKeyword & DecoFilterKind;



/**
 * Deco Id option object
 * */
export interface DecoIdOpt {


    /**
     * Single field name for decorator value
     *
     * - Easy way to reach single value of a decorator
     * */
    single?: string;
    /**
     * Decorator can be assigned to a class
     *
     * - Option type is {@link Target}
     * - If any of them is not set, all targets will be selected {@link DecoIdOpt.clazz} {@link DecoIdOpt.method} {@link DecoIdOpt.field} {@link DecoIdOpt.parameter}
     * */
    clazz?: boolean;
    /**
     * Decorator can be assigned to a method
     *
     * - Option type is {@link Target}
     * - Method means that a property with type is function
     * - You can forbid decorator for instance methods with {@link DecoIdOpt.notInstance}
     * - You can forbid decorator for static methods with {@link DecoIdOpt.notStatic}
     * - If any of them is not set, all targets will be selected {@link DecoIdOpt.clazz} {@link DecoIdOpt.method} {@link DecoIdOpt.field} {@link DecoIdOpt.parameter}
     * */
    method?: boolean;
    /**
     * Decorator can be assigned to a field
     *
     * - Option type is {@link Target}
     * - Field means that a property with type is not function
     * - In JS, property is used for property and method, we used field to avoid ambiguity
     * - You can forbid decorator for instance fields with {@link DecoIdOpt.notInstance}
     * - You can forbid decorator for static fields with {@link DecoIdOpt.notStatic}
     * - If any of them is not set, all targets will be selected {@link DecoIdOpt.clazz} {@link DecoIdOpt.method} {@link DecoIdOpt.field} {@link DecoIdOpt.parameter}
     * */
    field?: boolean;
    /**
     * Target type is parameter, so decorator can be assigned to a parameter
     *
     * - Option type is {@link Target}
     * - You can forbid decorator for instance method parameters with {@link DecoIdOpt.notInstance}
     * - You can forbid decorator for static method parameters with {@link DecoIdOpt.notStatic}
     * - JS does not support to learn name of variable, so you need to pass parameter name to decorator
     * - If any of them is not set, all targets will be selected {@link DecoIdOpt.clazz} {@link DecoIdOpt.method} {@link DecoIdOpt.field} {@link DecoIdOpt.parameter}
     * */
    parameter?: boolean;

    /**
     * Decorator can not be assigned to instance properties and their parameters [if method]
     *
     * - Option type is {@link DecoScope}
     * - If it's not set then decorator can be assigned to any property [static or instance]
     * */
    notInstance?: boolean;
    /**
     * Decorator can not be assigned to static properties and their parameters [if method]
     *
     * - Option type is {@link DecoScope}
     * - If it's not set then decorator can be assigned to any property [static or instance]
     * */
    notStatic?: boolean;
    /**
     * Decorator definition will be removed from memory after initialization
     * - If it's not set then decorator values will be persistent and stored in reflect repository
     */
    notPersistent?: boolean;
    /**
     * Decorator values limited with one
     * - New appended values will overwrite existing values
     * - If it's not set then parent's multiple decorators stored as an array
     */
    notMultiple?: boolean;
    /**
     * Decorator will not inherit parent/inherited decorators
     * - If it's not set then parent's decorators will be inherited
     */
    notInheritor?: boolean;
}

/**
 * Decorator Identifier
 * */
export interface DecoIdLike<V extends RecLike = RecLike, S = unknown> {
    // region public
    info(detailed?: boolean): RecLike;
    get description(): string;
    /**
     * Forks a new instance from identifier
     * */
    fork(clazz: ObjectLike|FuncLike): DecoInstanceLike; // class
    fork(clazz: ObjectLike|FuncLike, propertyKey: PropertyKey): DecoInstanceLike; // field
    fork(clazz: ObjectLike|FuncLike, propertyKey: PropertyKey, descriptor: TypedPropertyDescriptor<unknown>): DecoInstanceLike; // method
    fork(clazz: ObjectLike|FuncLike, propertyKey: PropertyKey, index: number): DecoInstanceLike; // parameter
    fork(...descriptors: Array<unknown>): DecoInstanceLike;
    assign(coreReflect: CoreReflectLike, value: RecLike): void;
    // endregion public

    // region getter
    get name(): string;
    get fn(): FuncLike;

    get options(): DecoIdOpt;

    get single(): string | null;

    get forClass(): boolean;

    get forMethod(): boolean;

    get forField(): boolean;

    get forParameter(): boolean;

    get notInstance(): boolean;

    get notStatic(): boolean;

    get notPersistent(): boolean;

    get notMultiple(): boolean;

    get notInheritor(): boolean;

    get instances(): Array<DecoInstanceLike>;
    // endregion getter

    // region class
    assignedClasses(filter?: DecoFilter): Array<ClassReflectLike>; // class-name
    valueByClass(fn: FuncOrName, filter?: DecoFilter): V;
    valuesByClass(fn: FuncOrName, filter?: DecoFilter): Array<V>;
    singleByClass(fn: FuncOrName, filter?: DecoFilter): S;
    singlesByClass(fn: FuncOrName, filter?: DecoFilter): Array<S>;
    // endregion class
    // region property
    assignedProperties(filter?: DecoFilter): Array<PropertyReflectLike>; // class-name, property-name
    valueByProperty(fn: FuncOrName, propName: PropertyKey, filter?: DecoFilter): V;
    valuesByProperty(fn: FuncOrName, propName: PropertyKey, filter?: DecoFilter): Array<V>;
    singleByProperty(fn: FuncOrName, propName: PropertyKey, filter?: DecoFilter): S;
    singlesByProperty(fn: FuncOrName, propName: PropertyKey, filter?: DecoFilter): Array<S>;
    // endregion property
    // region parameter
    assignedParameters(filter?: DecoFilter): Array<ParameterReflectLike>; // class-name, property-name, index
    valueByParameter(fn: FuncOrName, propName: PropertyKey, index: number, filter?: DecoFilter): V;
    valuesByParameter(fn: FuncOrName, propName: PropertyKey, index: number, filter?: DecoFilter): Array<V>;
    singleByParameter(fn: FuncOrName, propName: PropertyKey, index: number, filter?: DecoFilter): S;
    singlesByParameter(fn: FuncOrName, propName: PropertyKey, index: number, filter?: DecoFilter): Array<S>;
    // endregion parameter
    usageName(field: string, target: ObjectLike|FuncLike, propertyKey?: PropertyKey, indexOrDescriptor?: number|FuncLike): string;
}

export interface DecoInstanceLike {
    info(detailed?: boolean): RecLike;
    get identifier(): DecoIdLike;

    get name(): string;

    get target(): Target;

    get assigned(): CoreReflectLike;

    set(value?: RecLike): CoreReflectLike;

    isOfClass(): boolean;

    isOfMethod(): boolean;

    isOfField(): boolean;

    isOfParameter(): boolean;

    asClass(): ClassReflectLike;

    asMethod(): PropertyReflectLike;

    asField(): PropertyReflectLike;

    asParameter(): ParameterReflectLike;

}

export type DecoAliasLambda<V extends RecLike = RecLike, S = unknown> = (v: V) => boolean;

export interface DecoAliasLike<V extends RecLike = RecLike, S = unknown> {
    // region getters
    info(detailed?: boolean): RecLike;
    get description(): string;
    get fn(): FuncLike;
    get name(): string;

    get id(): DecoIdLike<V, S>;

    get condition(): DecoAliasLambda<V, S>;

    // endregion getters
}

// endregion deco
// region reflect

export interface CoreReflectLike {
    // region getters
    info(detailed?: boolean): RecLike;
    get targetType(): Target;
    get description(): string;
    get currentIdentifier(): DecoIdLike;
    get currentInstance(): DecoInstanceLike;
    // endregion getters
    // region lyy
    lyyInstance(currentInstance: DecoInstanceLike): this;
    lyyToLastIdentifier(value: RecLike): this;
    lyyDecorators(filter?: DecoFilterBelongs): Map<DecoIdLike, Array<RecLike>>;
    // endregion lyy
    // region decorator
    setValue(identifier: FuncOrDecoId, value: RecLike): this;
    decorators(filter?: DecoFilterBelongs): Record<string, Array<RecLike>>;
    hasDecorator(identifier: FuncOrDecoId, filter?: DecoFilterBelongs): boolean;
    listValues<V extends RecLike = RecLike>(identifier: FuncOrDecoId, filter?: DecoFilterBelongs): Array<V>;
    getValue<V extends RecLike = RecLike>(identifier: FuncOrDecoId, filter?: DecoFilterBelongs): V;
    listSingles<S = unknown>(identifier: FuncOrDecoId, filter?: DecoFilterBelongs): Array<S>;
    getSingle<S = unknown>(identifier: FuncOrDecoId, filter?: DecoFilterBelongs): S;
    // endregion decorator
    // region filter-by
    filterByBelongs(identifier: FuncOrDecoId, filter?: DecoFilterBelongs): boolean;
    filterByTarget(...targets: Array<Target>): boolean;
    // endregion filter-by
}

export interface ReflectPoolLike {
    get description(): string;
    info(detailed?: boolean): RecLike;

    // region class
    get classMap(): Map<FuncLike, ClassReflectLike>;

    classes(filter?: DecoFilter): Array<ClassReflectLike>;

    getClass(fn: FuncOrName, filter?: DecoFilter): ClassReflectLike;

    hasClass(fn: FuncOrName, filter?: DecoFilter): boolean;

    classesBy(identifier: FuncOrDecoId, filter?: DecoFilter): Array<ClassReflectLike>;
    // endregion class

    // region deco
    /**
     * Identifies a decorator with default options[target: all, no constraint, no-single]
     * - Targets: [CLASS, METHOD, FIELD, PARAMETER] - ALL
     * - Constraints: [] - NONE
     * - Single: empty
     * */
    identify<V extends RecLike = RecLike, S = unknown>(fn: FuncLike, options?: DecoIdOpt): DecoIdLike<V, S>;

    /**
     * Identifies an alias decorator and binds it to a real decorator
     * with condition to differentiate aliases of decorator
     * */
    alias<V extends RecLike = RecLike, S = unknown>(fn: FuncLike, identifier: FuncLike, condition?: DecoAliasLambda<V, S>): DecoIdLike<V, S>;

    /**
     * Gets an identifier with given function or function name [and also FQN name]
     * - Default value of throwable is true, so if true, it will raise when it could not find the decorator
     *
     * @throws - DeveloperException(identifier.not.found)
     * */
    get<V extends RecLike = RecLike, S = unknown>(fn: FuncOrName, throwable?: boolean): DecoIdLike<V, S>;

    /**
     * Checks existence for an identifier with given function or function name [and also FQN name]
     * - Found item can be identifier or alias
     * */
    is(fn: FuncOrName): boolean;

    /**
     * Gets an identifier with given function or function name [and also FQN name]
     * - It searches in only identifiers, even if found item is alias, it ignores the found item
     * - If identifier could not be found, it raises an error
     * - If you want to find it whatever, please use {@link get}
     *
     * @throws - DeveloperException(identifier.not.found)
     * */
    getIdentifier<V extends RecLike = RecLike, S = unknown>(fn: FuncOrName): DecoIdLike<V, S>;


    /**
     * Checks existence for an identifier with given function or function name [and also FQN name]
     * - It returns false if found item is alias
     * - If you want to check it whatever, please use {@link is}
     * */
    isIdentifier(fn: FuncOrName): boolean;

    /**
     * Lists all identifiers as an object
     * */
    identifiers(): Record<string, DecoIdLike>;

    /**
     * Gets an identifier with given function or function name [and also FQN name]
     * - It searches in only aliases, even if found item is identifier, it ignores the found item
     * - If alias could not be found, it raises an error
     * - If you want to find it whatever, please use {@link get}
     *
     * @throws - DeveloperException(alias.not.found)
     * */
    getAlias<V extends RecLike = RecLike, S = unknown>(fn: FuncOrName): DecoAliasLike<V, S>;

    /**
     * Checks existence for an alias with given function or function name [and also FQN name]
     * - It returns false if found item is identifier
     * - If you want to check it whatever, please use {@link is}
     * */
    isAlias(fn: FuncOrName): boolean;

    /**
     * Lists all aliases as an object
     * */
    aliases(): Record<string, DecoAliasLike>;
    // endregion deco

}

export interface ClassReflectLike extends CoreReflectLike {
    // region getters
    info(detailed?: boolean): RecLike;
    get name(): string;
    get description(): string;
    get parent(): ClassReflectLike;
    get creator(): FuncLike;
    get body(): ObjectLike;
    // endregion getters
    // region methods
    create<T>(...params: Array<unknown>): T;
    // endregion methods
    // region instance-properties
    listInstancePropertyNames(filter?: DecoFilterScope & DecoFilterKind): Array<string>;
    listInstanceProperties(filter?: DecoFilterScope & DecoFilterKind): Array<PropertyReflectLike>;
    getInstanceProperty(name: PropertyKey, filter?: DecoFilterScope & DecoFilterKind): PropertyReflectLike;
    hasInstanceProperty(name: PropertyKey, filter?: DecoFilterScope & DecoFilterKind): boolean
    // endregion instance-properties
    // region static-properties
    listStaticPropertyNames(filter?: DecoFilterScope & DecoFilterKind): Array<string>;
    listStaticProperties(filter?: DecoFilterScope & DecoFilterKind): Array<PropertyReflectLike>;
    getStaticProperty(name: PropertyKey, filter?: DecoFilterScope & DecoFilterKind): PropertyReflectLike;
    hasStaticProperty(name: PropertyKey, filter?: DecoFilterScope & DecoFilterKind): boolean
    // endregion static-properties
    // region any-properties
    listAnyProperties(filter?: DecoFilter, identifier?: FuncOrDecoId): Array<PropertyReflectLike>;
    getAnyProperty(name: PropertyKey, filter?: DecoFilter): PropertyReflectLike;
    hasAnyProperty(name: PropertyKey, filter?: DecoFilter): boolean;
    // endregion any-properties
    // region lyy
    lyyRegisterProperty(name: PropertyKey, keyword: DecoKeyword, kind: DecoKind, callable?: FuncLike): PropertyReflectLike;
    lyyDecorators(filter?: DecoFilterBelongs): Map<DecoIdLike, Array<RecLike>>;
    // endregion lyy
}

export interface PropertyReflectLike extends CoreReflectLike {
    // region getters
    info(detailed?: boolean): RecLike;
    get name(): PropertyKey;
    get description(): string;
    get clazz(): ClassReflectLike;
    get proto(): PropertyReflectLike;
    get hasProto(): boolean;
    get type(): FuncLike;
    get callable(): FuncLike;
    get keyword(): DecoKeyword;
    get kind(): DecoKind;
    // endregion getters

    // region parameters
    listParameters(filter?: DecoFilter): Array<ParameterReflectLike>;
    hasParameter(index: number, filter?: DecoFilter): boolean;
    getParameter(index: number, filter?: DecoFilter): ParameterReflectLike;
    parametersBy(identifier: FuncOrDecoId): Array<ParameterReflectLike>;
    // endregion parameters

    // region filter-by
    filterByKeyword(filter?: DecoFilterKeyword): boolean;
    filterByKind(filter?: DecoFilterKind): boolean;
    // @todo sil
    filterByScope(clazz: ClassReflectLike, filter?: DecoFilterScope): boolean;
    // endregion filter-by

    lyyDecorators(filter?: DecoFilterBelongs): Map<DecoIdLike, Array<RecLike>>;
}

export interface ParameterReflectLike extends CoreReflectLike {
    // region getters
    info(detailed?: boolean): RecLike;
    get property(): PropertyReflectLike;
    get index(): number;
    get type(): FuncLike;
    get description(): string;
    // endregion getters

    // region decorator
    decorators(): Record<string, Array<RecLike>>;
    hasDecorator(identifier: FuncOrDecoId): boolean;
    listValues<V extends RecLike = RecLike>(identifier: FuncOrDecoId): Array<V>;
    getValue<V extends RecLike = RecLike>(identifier: FuncOrDecoId): V;
    listSingles<S = unknown>(identifier: FuncOrDecoId): Array<S>;
    getSingle<S = unknown>(identifier: FuncOrDecoId): S;
    // endregion decorator

}
// endregion reflect
export interface ReflectionOptionLike {
    wrapReflectMetadata(): this;
}