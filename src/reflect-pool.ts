import {DeveloperException, FuncLike, FuncOrName, leyyo, ObjectLike, RecLike} from "@leyyo/core";
import {fqn, Fqn} from "@leyyo/fqn";
import {
    ClassReflectLike,
    DecoAliasLambda,
    DecoAliasLike,
    DecoFilter,
    DecoIdLike,
    DecoIdOpt,
    DecoInstanceLike,
    FuncOrDecoId,
    ReflectPoolLike
} from "./index-types";
import {ClassReflect} from "./class-reflect";
import {COMPONENT_NAME, DECO_KEY, FQN_NAME} from "./internal-component";
import {Target} from "./index-enums";
import {DecoId} from "./deco-id";
import {DecoAlias} from "./deco-alias";
import {InternalReflect} from "./internal-reflect";
import {LyyDecoGetResult} from "./internal-types";

@Fqn(...FQN_NAME)
class ReflectPool implements ReflectPoolLike {
    private readonly _classMap: Map<FuncLike, ClassReflectLike>;
    private readonly _nameMap: Map<string, FuncLike>;
    private readonly _namesMap: Map<string, LyyDecoGetResult>;
    private readonly _identifierMap: Map<FuncLike, DecoIdLike>;
    private readonly _aliasMap: Map<FuncLike, DecoAliasLike>;
    private readonly LOGGER = leyyo.logger.assign(ReflectPool);

    constructor() {
        this._classMap = leyyo.repo.newMap(this, '_classMap');
        this._nameMap = leyyo.repo.newMap(this, 'names');
        this._namesMap = leyyo.repo.newMap(this, '_namesMap');
        this._identifierMap = leyyo.repo.newMap(this, '_identifierMap');
        this._aliasMap = leyyo.repo.newMap(this, '_aliasMap');
        leyyo.component.add(COMPONENT_NAME);
        leyyo.enumeration.add('Target', Target, ...FQN_NAME);
        fqn.refresh(this);
        this._identifier = this._identifier.bind(this);
        this._class = this._class.bind(this);
        InternalReflect.setIdentifier(this._identifier);
        InternalReflect.setClass(this._class);
    }
    // region private
    private _identifier<V extends RecLike = RecLike, S = unknown>(fn: FuncOrDecoId, throwable = true): DecoIdLike<V, S> {
        if (typeof fn === 'object' && fn instanceof DecoId) {
            return fn as DecoIdLike<V, S>;
        } else if (typeof fn === 'function') {
            return this.get<V, S>(fn, throwable);
        }
        new DeveloperException('reflection.invalid-decorator', {fn}).with(this).raise(throwable);
        return null;
    }
    _class(clazz: FuncOrName, body?: ObjectLike, currentInstance?: DecoInstanceLike): ClassReflectLike {
        let fn: FuncLike;
        if (typeof clazz === 'string') {
            fn = this._nameMap.get(clazz);
        } else if (typeof clazz === 'function') {
            fn = clazz;
        } else if (leyyo.is.object(clazz)) {
            fn = this._nameMap.get(fqn.name(clazz));
        } else {
            throw new DeveloperException('reflection.invalid-class', {clazz}).with(this);
        }
        if (!this._classMap.has(fn)) {
            const name = fqn.name(fn);
            this._classMap.set(fn, new ClassReflect(fn, body, currentInstance));
            this._nameMap.set(name, fn);
            this.LOGGER.log(`class registered`, {name});
        }
        return this._classMap.get(fn);
    }

    private _get<V extends RecLike = RecLike, S = unknown>(fn: FuncOrName): LyyDecoGetResult {
        const type = typeof fn;
        if (type == 'function') {
            const clazz = fn as FuncLike;
            if (this._identifierMap.has(clazz)) {
                return {type: 'identifier', id: this._identifierMap.get(clazz) as DecoIdLike<V, S>};
            }
            else if (this._aliasMap.has(clazz)) {
                return {type: 'alias', alias: this._aliasMap.get(clazz)};
            }
        } else if (type === "string") {
            const name = fn as string;
            if (this._namesMap.has(name)) {
                return this._namesMap.get(name);
            }
        }
        return {type: null};
    }
    protected _setDesc(fn: FuncLike, id: DecoIdLike): void {
        Object.defineProperty(fn, DECO_KEY, {value: id, configurable: false, writable: false, enumerable: false});
    }

    // endregion private
    get description(): string {
        return `<reflect>`;
    }
    info(detailed?: boolean): RecLike {
        const rec = {classes: [], identifiers: [], aliases: []};
        for (const [, clazz] of this._classMap.entries()) {
            rec.classes.push(clazz.info(detailed));
        }
        for (const [, id] of this._identifierMap.entries()) {
            rec.identifiers.push(id.info(detailed));
        }
        for (const [, alias] of this._aliasMap.entries()) {
            rec.aliases.push(alias.info(detailed));
        }
        return rec;
    }

    get classMap(): Map<FuncLike, ClassReflectLike> {
        return this._classMap;
    }
    // region class

    classes(filter?: DecoFilter): Array<ClassReflectLike> {
        const result: Array<ClassReflectLike> = [];
        for (const [, clazz] of this._nameMap.entries()) {
            result.push(this._classMap.get(clazz));
        }
        return result;
    }

    getClass(fn: FuncOrName, filter?: DecoFilter): ClassReflectLike {
        const type = typeof fn;
        if (type == 'function') {
            const clazz = fn as FuncLike;
            if (this._classMap.has(clazz)) {
                return this._classMap.get(clazz);
            }
        } else {
            if (type === 'object') {
                fn = fqn.name(fn);
            }
            if (typeof fn === 'string') {
                const name = fqn.name(fn);
                if (this._nameMap.has(name)) {
                    const clazz = this._nameMap.get(name);
                    if (this._classMap.has(clazz)) {
                        return this._classMap.get(clazz);
                    }
                }
            }
        }
        throw new Error('Class absent with name ' + fqn.name(fn));
    }

    hasClass(fn: FuncOrName, filter?: DecoFilter): boolean {
        const type = typeof fn;
        if (type == 'function') {
            return this._classMap.has(fn as FuncLike);
        } else {
            if (type === 'object') {
                fn = fqn.name(fn);
            }
            if (typeof fn === 'string') {
                const name = fqn.name(fn);
                if (this._nameMap.has(name)) {
                    return this._classMap.has(this._nameMap.get(name));
                }
            }
        }
        return false;
    }

    classesBy(identifier: FuncOrDecoId, filter?: DecoFilter): Array<ClassReflectLike> {
        const id = InternalReflect.identifier(identifier, false);
        if (!id) {
            return [];
        }
        const list: Array<ClassReflectLike> = [];
        for (const [, clazz] of this._classMap.entries()) {
            if (clazz.hasDecorator(id, filter)) {
                list.push(clazz);
            }
        }
        return list;
    }
    // endregion class
    // region identifier
    identify<V extends RecLike = RecLike, S = unknown>(fn: FuncLike, options?: DecoIdOpt): DecoIdLike<V, S> {
        if (typeof fn !== 'function') {
            throw new DeveloperException(`identifier.should.be.function`, {type: typeof fn}).with(this);
        }
        if (fn[DECO_KEY] !== undefined) {
            return fn[DECO_KEY] as DecoIdLike<V, S>;
        }
        const id = new DecoId<V, S>(fn, options);
        this._identifierMap.set(fn, id);
        const name = fqn.name(fn);
        if (this._namesMap.has(name)) {
            this.LOGGER.warn('decorator.name.already.registered', {name});
        }
        this._namesMap.set(name, {type: 'identifier', id});
        this._setDesc(fn, id);
        this.LOGGER.info('identified', {name, fn});
        return id;
    }
    alias<V extends RecLike = RecLike, S = unknown>(fn: FuncLike, identifier: FuncLike, condition?: DecoAliasLambda<V, S>): DecoIdLike<V, S> {
        if (typeof fn !== 'function') {
            throw new DeveloperException(`alias.should.be.function`, {type: typeof fn}).with(this);
        }
        if (typeof identifier !== 'function') {
            throw new DeveloperException(`identifier.should.be.function`, {type: typeof identifier}).with(this);
        }
        if (fn[DECO_KEY] !== undefined) {
            return fn[DECO_KEY] as DecoIdLike<V, S>;
        }
        if (!leyyo.is.empty(condition) && typeof condition !== 'function') {
            throw new DeveloperException('condition.should.be.function', {condition}).with(this);
        }
        if (identifier[DECO_KEY] === undefined) {
            throw new DeveloperException('referenced.function.should.be.decorator', {identifier}).with(this);
        }
        const id = identifier[DECO_KEY] as DecoIdLike<V, S>;
        const alias = new DecoAlias<RecLike>(fn, id, condition);
        this._aliasMap.set(fn, alias);
        const name = fqn.name(fn);
        if (this._namesMap.has(name)) {
            this.LOGGER.warn('decorator.name.already.registered', {name});
        }
        this._namesMap.set(name, {type: 'alias', alias});
        this._setDesc(fn, id);
        return id;
    }
    get<V extends RecLike = RecLike, S = unknown>(fn: FuncOrName, throwable = true): DecoIdLike<V, S> {
        const {id, alias} = this._get<V, S>(fn);
        if (id) {
            return id as DecoIdLike<V, S>;
        }
        else if (alias) {
            return alias.id as DecoIdLike<V, S>;
        }
        if (throwable) {
            throw new DeveloperException('identifier.not.found', {fn}).with(this);
        }
        return null;
    }
    is(fn: FuncOrName): boolean {
        const {id} = this._get(fn);
        return !!id;
    }

    isIdentifier(fn: FuncOrName): boolean {
        const {type} = this._get(fn);
        return type === 'identifier';
    }
    getIdentifier<V extends RecLike = RecLike, S = unknown>(fn: FuncOrName): DecoIdLike<V, S> {
        const {id} = this._get<V, S>(fn);
        if (id) {
            return id as DecoIdLike<V, S>;
        }
        throw new DeveloperException('identifier.not.found', {fn}).with(this);
    }
    identifiers(): Record<string, DecoIdLike> {
        const result: Record<string, DecoIdLike> = {};
        for (const [name, getRec] of this._namesMap.entries()) {
            if (getRec.id) {
                result[name] = getRec.id;
            }
        }
        return result;
    }
    // endregion identifier
    // region alias
    aliases(): Record<string, DecoAliasLike> {
        const result: Record<string, DecoAliasLike> = {};
        for (const [name, getRec] of this._namesMap.entries()) {
            if (getRec.alias) {
                result[name] = getRec.alias;
            }
        }
        return result;
    }
    getAlias<V extends RecLike = RecLike, S = unknown>(fn: FuncOrName): DecoAliasLike<V, S> {
        const {alias} = this._get<V, S>(fn);
        if (alias) {
            return alias as DecoAliasLike<V, S>;
        }
        throw new DeveloperException('alias.not.found', {fn}).with(this);
    }
    isAlias(fn: FuncOrName): boolean {
        const {type} = this._get(fn);
        return type === 'alias';
    }
    // endregion alias

}
export const reflectPool: ReflectPoolLike = new ReflectPool();
leyyo.decoPool.set(reflectPool);

