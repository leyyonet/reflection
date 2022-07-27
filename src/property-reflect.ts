import "reflect-metadata";
import {FuncLike, leyyo, RecLike} from "@leyyo/core";
import {fqn, Fqn} from "@leyyo/fqn";
import {
    ClassReflectLike,
    DecoFilter,
    DecoFilterBelongs,
    DecoFilterKeyword,
    DecoFilterKind,
    DecoFilterScope,
    DecoIdLike,
    DecoKeyword,
    DecoKind,
    FuncOrDecoId,
    ParameterReflectLike,
    PropertyReflectLike
} from "./index-types";
import {AbstractReflect} from "./abstract-reflect";
import {ParameterReflect} from "./parameter-reflect";
import {FQN_NAME} from "./internal-component";
import {Target} from "./index-enums";
import {InternalReflect} from "./internal-reflect";

@Fqn(...FQN_NAME)
export class PropertyReflect extends AbstractReflect implements PropertyReflectLike {
    // region properties
    private readonly _name: PropertyKey;
    private readonly _clazz: ClassReflectLike;
    private readonly _type: FuncLike;
    private readonly _callable: FuncLike;
    private readonly _parameters: Array<ParameterReflectLike>;
    private readonly _keyword: DecoKeyword;
    private readonly _kind: DecoKind;
    private readonly _proto: PropertyReflectLike;
    // endregion properties
    // region methods
    constructor(clazz: ClassReflectLike, name: PropertyKey, keyword: DecoKeyword, kind: DecoKind, callable?: FuncLike) {
        super(clazz.currentInstance);
        this._parameters = [];
        this._clazz = clazz;
        this._name = name;
        this._keyword = keyword;
        this._proto = null;
        if (kind === 'method') {
            this._kind = kind;
            this._callable = typeof callable === 'function' ? callable : null;
            this._targetType = Target.METHOD;
            if (this._clazz.body && !this._callable) {
                this._callable = this._clazz.body[this._name];
            }
            if (leyyo.is.object(this._clazz.body)) {
                this._type = Reflect.getMetadata('design:returntype', this._clazz.body, this._name as string) as FuncLike;
                const params = Reflect.getMetadata('design:paramtypes', this._clazz.body, this._name as string) as Array<FuncLike>;
                if (leyyo.is.array(params, true)) {
                    params.forEach((param, index) => {
                        this._parameters.push(new ParameterReflect(this, index, param));
                    });
                }
            } else if (this._callable) {
                for (let i = 0; i < this._callable.length; i++) {
                    this._parameters.push(new ParameterReflect(this, i, null));
                }
            }
        } else {
            this._kind = 'field';
            this._callable = null;
            this._targetType = Target.FIELD;
            if (leyyo.is.object(this._clazz.body)) {
                this._type = Reflect.getMetadata('design:type', this._clazz.body, this._name as string) as FuncLike;
            }
        }
        if (this._clazz?.parent) {
            this._proto = (this._keyword === 'instance') ? this._clazz.parent.getInstanceProperty(name) : this._clazz.parent.getStaticProperty(name);
        }
    }
    // endregion methods
    // region getters
    info(detailed?: boolean): RecLike {
        let rec = {
            name: this._name,
            description: this.description,
            clazz: {'$ref': this._clazz.description}
        } as RecLike;
        if (detailed) {
            rec = {...rec,
                type: fqn.signed(this._type, true),
                keyword: this._keyword,
                kind: this._kind
            };
        }
        if (detailed && this._kind === "method") {
            rec['callable'] = fqn.signed(this._callable, true);
            rec['parameters'] = this._parameters.map(p => p.info(detailed));
        }
        if (this._proto) {
            rec['proto'] = {'$ref': this._proto.description};
        }
        return rec;
    }
    get name(): PropertyKey {
        return this._name;
    }
    get description(): string {
        return `<${this._kind}>${this._clazz.name}.${this._name as string} [${this._keyword}]`;
    }
    get clazz(): ClassReflectLike {
        return this._clazz;
    }
    get proto(): PropertyReflectLike {
        return this._proto;
    }
    get hasProto(): boolean {
        return !!this._proto;
    }
    get type(): FuncLike {
        return this._type;
    }
    get callable(): FuncLike {
        return this._callable;
    }
    get keyword(): DecoKeyword {
        return this._keyword;
    }
    get kind(): DecoKind {
        return this._kind;
    }
    // endregion getters
    // region parameters
    listParameters(filter?: DecoFilter): Array<ParameterReflectLike> {
        return this._parameters;
    }

    hasParameter(index: number, filter?: DecoFilter): boolean {
        return this._parameters[index] !== undefined;
    }

    getParameter(index: number, filter?: DecoFilter): ParameterReflectLike {
        return this._parameters[index] ?? null;
    }

    parametersBy(identifier: FuncOrDecoId, filter?: DecoFilter): Array<ParameterReflectLike> {
        const id = InternalReflect.identifier(identifier, false);
        if (!id) {
            return [];
        }
        return this._parameters.filter(param => param.filterByBelongs(id, filter));
    }
    // endregion parameters
    // region filter-by
    filterByKeyword(filter?: DecoFilterKeyword): boolean {
        switch (filter?.keyword) {
            case "instance":
                return this._keyword === "instance";
            case "static":
                return this._keyword === "static";
        }
        return true;
    }
    filterByKind(filter?: DecoFilterKind): boolean {
        switch (filter?.kind) {
            case "field":
                return this._kind === 'field';
            case "method":
                return this._kind === 'method';
        }
        return true;
    }
    filterByScope(clazz: ClassReflectLike, filter?: DecoFilterScope): boolean {
        switch (filter?.scope) {
            case "owned":
                return this._clazz === clazz;
            case "inherited":
                return this._clazz !== clazz;
        }
        return true;
    }
    // endregion filter-by
    // region lyy
    lyyDecorators(filter?: DecoFilterBelongs): Map<DecoIdLike, Array<RecLike>> {
        switch (filter?.belongs) {
            case "self":
                return this._decoratorMap;
            case "parent":
                if (this._proto) {
                    return this._proto.lyyDecorators(filter);
                } else {
                    return this._emptyDecoMap;
                }
        }
        if (this._proto) {
            return new Map<DecoIdLike, Array<RecLike>>([...this._decoratorMap, ...this._proto.lyyDecorators(filter)]);
        } else {
            return this._decoratorMap;
        }
    }
    // endregion lyy
}
