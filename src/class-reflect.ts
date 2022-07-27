import {DeveloperException, FuncLike, leyyo, ObjectLike, RecLike, S_CLASSES} from "@leyyo/core";
import {fqn, Fqn} from "@leyyo/fqn";
import {AbstractReflect} from "./abstract-reflect";
import {PropertyReflect} from "./property-reflect";
import {
    ClassReflectLike,
    DecoFilter,
    DecoFilterBelongs,
    DecoFilterKind,
    DecoFilterScope,
    DecoIdLike,
    DecoInstanceLike,
    DecoKeyword,
    DecoKind,
    FuncOrDecoId,
    PropertyReflectLike
} from "./index-types";
import {FQN_NAME} from "./internal-component";
import {Target} from "./index-enums";
import {InternalReflect} from "./internal-reflect";

@Fqn(...FQN_NAME)
export class ClassReflect extends AbstractReflect implements ClassReflectLike {
    // region properties
    private readonly _parent: ClassReflectLike;
    private readonly _body: ObjectLike;
    private readonly _creator: FuncLike;
    private readonly _instanceMap: Map<PropertyKey, PropertyReflectLike>;
    private readonly _staticMap: Map<PropertyKey, PropertyReflectLike>;
    private readonly _propCache: Map<PropertyKey, Array<PropertyReflectLike>>;
    // endregion properties
    // region methods
    constructor(creator: FuncLike, body?: ObjectLike, currentInstance?: DecoInstanceLike) {
        super(currentInstance);
        this._targetType = Target.CLASS;
        this._instanceMap = new Map<PropertyKey, PropertyReflectLike>();
        this._staticMap = new Map<PropertyKey, PropertyReflectLike>();
        this._propCache = new Map<PropertyKey, Array<PropertyReflectLike>>();
        this._creator = creator;
        this._body = body;
        const prototypeOf = Object.getPrototypeOf(creator);
        // console.log(`${creator.name}.prototypeOf => ${typeof prototypeOf}`);
        if (prototypeOf && prototypeOf.name && !S_CLASSES.includes(prototypeOf.name)) {
            this._parent = InternalReflect.clazz(prototypeOf);
        }
        // region instance-members
        Object.getOwnPropertyNames(creator.prototype).forEach(key => {
            const desc = leyyo.system.propertyDescriptor(creator.prototype, key, true);
            if (desc) {
                const kind: DecoKind = (typeof desc.value === 'function') ? 'method' : 'field';
                this.lyyRegisterProperty(key, 'instance', kind, desc.value);
            }
        });
        // endregion instance-members
        // region static-members
        Object.getOwnPropertyNames(creator).forEach(key => {
            if (!['length', 'name'].includes(key)) {
                const desc = leyyo.system.propertyDescriptor(creator, key, false);
                if (desc) {
                    const kind: DecoKind = (typeof desc.value === 'function') ? 'method' : 'field';
                    this.lyyRegisterProperty(key, 'static', kind, desc.value);
                }
            }
        });
        // endregion static-members

    }
    create<T>(...params: Array<unknown>): T {
        return this._creator(...params) as T;
    }
    // endregion methods
    // region private
    protected _listProperties(keyword: DecoKeyword, FFF?: DecoFilterScope & DecoFilterKind): Array<PropertyReflectLike> {
        let props: Array<PropertyReflectLike>;
        FFF = InternalReflect.FFF(FFF, 'kind', 'scope');
        const key = `${this.name}~${keyword}~${FFF.scope ?? ''}~${FFF.kind ?? ''}`;
        if (this._propCache.has(key)) {
            return this._propCache.get(key);
        }
        const ins = (keyword === "instance");
        // 'listInstanceProperties', '_instanceMap'
        switch (FFF.scope) {
            case "owned":
                props = Array.from((ins ? this._instanceMap : this._staticMap).values());
                if (FFF.kind) {
                    props = props.filter(prop => prop.filterByKind(FFF));
                }
                this._propCache.set(key, props);
                return props;
            case "inherited":
                if (this._parent) {
                    delete FFF.scope;
                    props = ins ? this._parent.listInstanceProperties(FFF) : this._parent.listStaticProperties(FFF);
                } else {
                    props = [];
                }
                this._propCache.set(key, props);
                return props;
        }
        props = Array.from((ins ? this._instanceMap : this._staticMap).values());
        if (FFF.kind) {
            props = props.filter(prop => prop.filterByKind(FFF));
        }
        if (this._parent) {
            const selfNames = props.map(prop => prop.name);
            const parentProps = (keyword === "instance") ? this._parent.listInstanceProperties(FFF) : this._parent.listStaticProperties(FFF);
            if (selfNames.length < 1) {
                props.push(...parentProps);
            } else {
                parentProps.forEach(prop => {
                    if (!selfNames.includes(prop.name)) {
                        props.push(prop);
                    }
                });
            }
        }
        this._propCache.set(key, props);
        return props;
    }
    // endregion private
    // region getters
    info(detailed?: boolean): RecLike {
        const rec = {...{
            name: this.name,
            creator: fqn.signed(this._creator, true),
            body: detailed ? fqn.signed(this._body, true) : undefined,
            instances: [],
            statics: []
        }, ...super.info(detailed)};
        if (this._parent) {
            rec['parent'] = {'$ref': this._parent.description};
        }
        for (const [, prop] of this._instanceMap.entries()) {
            rec.instances.push(prop.info(detailed));
        }
        for (const [, prop] of this._staticMap.entries()) {
            rec.statics.push(prop.info(detailed));
        }
        return rec;
    }
    get name(): string {
        return fqn.name(this._creator);
    }
    get description(): string {
        return `<class>${this.name}`;
    }
    get parent(): ClassReflectLike {
        return this._parent;
    }
    get creator(): FuncLike {
        return this._creator;
    }
    get body(): ObjectLike {
        return this._body;
    }
    // endregion getters
    // region instance-properties
    listInstancePropertyNames(filter?: DecoFilterScope & DecoFilterKind): Array<string> {
        return this.listInstanceProperties(filter).map(prop => prop.name as string);
    }
    listInstanceProperties(filter?: DecoFilterScope & DecoFilterKind): Array<PropertyReflectLike> {
        return this._listProperties("instance", filter);
    }
    getInstanceProperty(name: PropertyKey, filter?: DecoFilterScope & DecoFilterKind): PropertyReflectLike {
        const props = this.listInstanceProperties(filter).filter(prop => prop.name === name);
        return props.length > 0 ? props[0] : null;
    }
    hasInstanceProperty(name: PropertyKey, filter?: DecoFilterScope & DecoFilterKind): boolean {
        return this.listInstanceProperties(filter).filter(prop => prop.name === name).length > 0;
    }
    // endregion instance-properties
    // region static-properties
    listStaticPropertyNames(filter?: DecoFilterScope & DecoFilterKind): Array<string> {
        return this.listStaticProperties(filter).map(prop => prop.name as string);
    }
    listStaticProperties(filter?: DecoFilterScope & DecoFilterKind): Array<PropertyReflectLike> {
        return this._listProperties('static', filter);
    }
    getStaticProperty(name: PropertyKey, filter?: DecoFilterScope & DecoFilterKind): PropertyReflectLike {
        const props = this.listStaticProperties(filter).filter(prop => prop.name === name);
        return props.length > 0 ? props[0] : null;
    }
    hasStaticProperty(name: PropertyKey, filter?: DecoFilterScope & DecoFilterKind): boolean {
        return this.listStaticProperties(filter).filter(prop => prop.name === name).length > 0;
    }
    // endregion static-properties
    // region any-properties
    listAnyProperties(filter?: DecoFilter, identifier?: FuncOrDecoId): Array<PropertyReflectLike> {
        let properties: Array<PropertyReflectLike>;
        switch (filter?.keyword) {
            case "instance":
                properties = this.listInstanceProperties(filter);
                break;
            case "static":
                properties = this.listStaticProperties(filter);
                break;
            default:
                properties = [...this.listInstanceProperties(filter), ...this.listStaticProperties(filter)];
                break;
        }
        if (identifier) {
            const id = InternalReflect.identifier(identifier, false);
            if (!id) {
                return [];
            }
            return properties.filter(item => item.filterByBelongs(id, filter))
        }
        return properties;
    }
    getAnyProperty(name: PropertyKey, filter?: DecoFilter): PropertyReflectLike {
        switch (filter?.keyword) {
            case "instance":
                return this.getInstanceProperty(name, filter);
            case "static":
                return this.getStaticProperty(name, filter);
        }
        return this.getInstanceProperty(name, filter) ?? this.getStaticProperty(name, filter);
    }
    hasAnyProperty(name: PropertyKey, filter?: DecoFilter): boolean {
        switch (filter?.keyword) {
            case "instance":
                return this.hasInstanceProperty(name, filter);
            case "static":
                return this.hasStaticProperty(name, filter);
        }
        return this.hasInstanceProperty(name, filter) || this.hasStaticProperty(name, filter);
    }
    // endregion any-properties
    // region lyy
    lyyRegisterProperty(name: PropertyKey, keyword: DecoKeyword, kind: DecoKind, callable?: FuncLike): PropertyReflectLike {
        switch (keyword) {
            case "instance":
                if (!this._instanceMap.has(name)) {
                    const ins = new PropertyReflect(this, name, keyword, kind, callable);
                    this._instanceMap.set(name, ins);
                }
                return this._instanceMap.get(name);
            case "static":
                if (!this._staticMap.has(name)) {
                    const ins = new PropertyReflect(this, name, keyword, kind, callable);
                    this._staticMap.set(name, ins);
                }
                return this._staticMap.get(name);
        }
        throw new DeveloperException('invalid.keyword', {clazz: this.name, property: name});
    }
    lyyDecorators(filter?: DecoFilterBelongs): Map<DecoIdLike, Array<RecLike>> {
        switch (filter?.belongs) {
            case "self":
                return this._decoratorMap;
            case "parent":
                if (this._parent) {
                    return this._parent.lyyDecorators(filter);
                } else {
                    return this._emptyDecoMap;
                }
        }
        if (this._parent) {
            return new Map<DecoIdLike, Array<RecLike>>([...this._decoratorMap, ...this._parent.lyyDecorators(filter)]);
        } else {
            return this._decoratorMap;
        }
    }
    // endregion lyy
}
