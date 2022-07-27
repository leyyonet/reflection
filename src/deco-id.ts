import {FuncLike, FuncOrName, leyyo, ObjectLike, RecLike} from "@leyyo/core";
import {fqn, Fqn} from "@leyyo/fqn";
import {
    ClassReflectLike,
    CoreReflectLike,
    DecoFilter,
    DecoIdLike,
    DecoIdOpt,
    DecoInstanceLike,
    ParameterReflectLike,
    PropertyReflectLike
} from "./index-types";
import {DecoInstance} from "./deco-instance";
import {FQN_NAME} from "./internal-component";
import {Target} from "./index-enums";
import {InternalReflect} from "./internal-reflect";

@Fqn(...FQN_NAME)
export class DecoId<V extends RecLike = RecLike, S = unknown> implements DecoIdLike<V, S> {
    private readonly _fn: FuncLike;
    private readonly _instances: Array<DecoInstanceLike>;
    private readonly _options: DecoIdOpt;
    private static readonly BOOL_FIELDS = ['clazz', 'method', 'field', 'parameter',
        'notInstance', 'notStatic', 'notPersistent', 'notMultiple', 'notInheritor'];

    private _getSingles(values: Array<V>): Array<S> {
        if (values.length < 1) {
            return [];
        }
        const list: Array<S> = [];
        values.forEach(value => {
            if (value && value[this._options.single] !== undefined) {
                list.push(value[this._options.single] as S);
            }
        })
        return list;
    }
    private _getSingle(value: V): S {
        return value ? value[this._options.single] as S : undefined;
    }

    constructor(fn: FuncLike, opt?: DecoIdOpt) {
        this._fn = fn;
        opt = leyyo.primitive.object(opt) ?? {};
        DecoId.BOOL_FIELDS.forEach(f => {
            opt[f] = leyyo.primitive.boolean(opt[f]);
        });
        if (!opt.clazz && !opt.method && !opt.field && !opt.parameter) {
            opt.clazz = true;
            opt.method = true;
            opt.field = true;
            opt.parameter = true;
        }
        opt.single = leyyo.primitive.text(opt.single);
        this._options = opt;
        this._instances = [];
    }
    // region getter
    info(detailed?: boolean): RecLike {
        const rec = {
            name: this.name,
        } as RecLike;
        if (detailed) {
            rec.options = this._options;
        }
        return rec;
    }
    get name(): string {return fqn.name(this._fn);}
    get fn(): FuncLike {return this._fn;}
    get description(): string {
        return `<identifier>${this.name}`;
    }
    get forClass(): boolean {return this._options.clazz;}
    get forMethod(): boolean {return this._options.method;}
    get forField(): boolean {return this._options.field;}
    get forParameter(): boolean {return this._options.parameter;}
    get notInstance(): boolean {return this._options.notInstance;}
    get notStatic(): boolean {return this._options.notStatic;}
    get notPersistent(): boolean {return this._options.notPersistent;}
    get notMultiple(): boolean {return this._options.notMultiple;}
    get notInheritor(): boolean {return this._options.notInheritor;}
    get options(): DecoIdOpt {return this._options;}
    get single(): string|null {return this._options.single;}
    get instances(): Array<DecoInstanceLike> {return this._instances;}
    // endregion getter

    // region public
    fork(...descriptors: Array<unknown>): DecoInstanceLike {
        return new DecoInstance(this, descriptors);
    }

    assign(coreReflect: CoreReflectLike, value: RecLike): void {
        coreReflect.setValue(this, value);
    }
    // endregion public



    // region class
    assignedClasses(filter?: DecoFilter): Array<ClassReflectLike> {
        return this._instances.map(ins => ins.assigned as ClassReflectLike)
            .filter(item => item.filterByTarget(Target.CLASS))
            .filter(item => item.filterByBelongs(this, filter));
    }
    valueByClass(fn: FuncOrName, filter?: DecoFilter): V {
        return InternalReflect.clazz(fn).getValue(this, filter) as V;
    }
    valuesByClass(fn: FuncOrName, filter?: DecoFilter): Array<V> {
        return InternalReflect.clazz(fn).listValues(this, filter) as Array<V>;
    }
    singleByClass(fn: FuncOrName, filter?: DecoFilter): S {
        return this._options.single ? this._getSingle(this.valueByClass(fn, filter)) : undefined;
    }
    singlesByClass(fn: FuncOrName, filter?: DecoFilter): Array<S> {
        return this._options.single ? this._getSingles(this.valuesByClass(fn, filter)) : [];
    }
    // endregion class
    // region property
    assignedProperties(filter?: DecoFilter): Array<PropertyReflectLike> {
        return this._instances
            .map(ins => ins.assigned as PropertyReflectLike)
            .filter(item => item.filterByTarget(Target.METHOD, Target.FIELD))
            .filter(item => item.filterByKind(filter))
            .filter(item => item.filterByBelongs(this, filter))
        ;
    }
    valueByProperty(fn: FuncOrName, propName: PropertyKey, filter?: DecoFilter): V {
        const prop = InternalReflect.clazz(fn).getAnyProperty(propName, filter);
        return prop?.getValue(this, filter) as V ?? null;
    }
    valuesByProperty(fn: FuncOrName, propName: PropertyKey, filter?: DecoFilter): Array<V> {
        const prop = InternalReflect.clazz(fn).getAnyProperty(propName, filter);
        return prop?.listValues(this, filter) as Array<V> ?? [];
    }
    singleByProperty(fn: FuncOrName, propName: PropertyKey, filter?: DecoFilter): S {
        return this._options.single ? this._getSingle(this.valueByProperty(fn, propName, filter)) : undefined;
    }
    singlesByProperty(fn: FuncOrName, propName: PropertyKey, filter?: DecoFilter): Array<S> {
        return this._options.single ? this._getSingles(this.valuesByProperty(fn, propName, filter)) : [];
    }
    // endregion property
    // region parameter
    assignedParameters(filter?: DecoFilter): Array<ParameterReflectLike> {
        return this._instances
            .map(ins => ins.assigned as ParameterReflectLike)
            .filter(item => item.filterByTarget(Target.PARAMETER))
            .filter(item => item.filterByBelongs(this, filter))
        ;
    }
    valueByParameter(fn: FuncOrName, name: PropertyKey, index: number, filter?: DecoFilter): V {
        filter = filter ?? {};
        filter.kind = 'method';
        const prop = InternalReflect.clazz(fn).getAnyProperty(name, filter);
        if (!prop || !prop.hasParameter(index, filter)) {
            return null;
        }
        const param = prop.getParameter(index, filter);
        return param.getValue(this) as V;
    }
    valuesByParameter(fn: FuncOrName, name: PropertyKey, index: number, filter?: DecoFilter): Array<V> {
        filter = filter ?? {};
        filter.kind = 'method';
        const prop = InternalReflect.clazz(fn).getAnyProperty(name, filter);
        if (!prop || !prop.hasParameter(index, filter)) {
            return [];
        }
        const param = prop.getParameter(index, filter);
        return param.listValues(this) as Array<V>;
    }
    singleByParameter(fn: FuncOrName, propName: PropertyKey, index: number, filter?: DecoFilter): S {
        return this._options.single ? this._getSingle(this.valueByParameter(fn, propName, index, filter)) : undefined;
    }
    singlesByParameter(fn: FuncOrName, propName: PropertyKey, index: number, filter?: DecoFilter): Array<S> {
        return this._options.single ? this._getSingles(this.valuesByParameter(fn, propName, index, filter)) : [];
    }
    // endregion parameter

    usageName(field: string, target: ObjectLike|FuncLike, propertyKey?: PropertyKey, indexOrDescriptor?: number|FuncLike): string {
        let fn: FuncLike;
        let keyword: string;
        if (typeof target === 'function') {
            fn = target as FuncLike;
            keyword = 'static';
        } else if (leyyo.is.func(target?.constructor)) {
            fn = target?.constructor as FuncLike;
            keyword = 'instance';
        } else {
            return `${this.name}.${field} on <unknown>${fqn.name(target)}`;
        }
        // class
        if (!propertyKey) {
            return `${this.name}.${field} on <class>${fqn.name(fn)}`;
        }
        // if 3rd argument is number then its index so its parameter decorator
        if (typeof indexOrDescriptor === 'number') {
            return `${this.name}.${field} on <parameter>${fqn.name(fn)}::${propertyKey as string}[${keyword}] #${indexOrDescriptor}`;
        }
        // method decorator
        if (indexOrDescriptor && typeof (indexOrDescriptor as PropertyDescriptor).value === 'function') {
            return `${this.name}.${field} on <method>${fqn.name(fn)}::${propertyKey as string}[${keyword}]`;
        }
        // field decorator, it can be 3rd arg is undefined
        return `${this.name}.${field} on <field>${fqn.name(fn)}::${propertyKey as string}[${keyword}]`;
    }




}






