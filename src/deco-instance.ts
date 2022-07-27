import {DeveloperException, FuncLike, ObjectLike, RecLike} from "@leyyo/core";
import {Fqn} from "@leyyo/fqn";
import {
    ClassReflectLike,
    CoreReflectLike,
    DecoIdLike,
    DecoInstanceLike,
    DecoKeyword,
    ParameterReflectLike,
    PropertyReflectLike
} from "./index-types";
import {FQN_NAME} from "./internal-component";
import {Target} from "./index-enums";
import {InternalReflect} from "./internal-reflect";

@Fqn(...FQN_NAME)
export class DecoInstance implements DecoInstanceLike {
    private readonly _identifier: DecoIdLike;
    private readonly _target: Target;
    private readonly _assigned: CoreReflectLike;
    info(detailed?: boolean): RecLike {
        return this._identifier.info(detailed);
    }


    constructor(identifier: DecoIdLike, args: Array<unknown>) {
        let KEYWORD: DecoKeyword = 'instance';
        let FNC: FuncLike = null;
        let BODY: ObjectLike = null;
        let MEMBER_NAME: string = null;
        let METHOD_BODY: FuncLike = null;
        let INDEX: number;
        this._identifier = identifier;
        identifier.instances.push(this);
        const targetObj = args[0] as ObjectLike|FuncLike;
        const type = typeof targetObj;
        if (type === 'function') {
            KEYWORD = 'static';
            FNC = targetObj as FuncLike;
        } else if (type === 'object' && targetObj && targetObj.constructor) {
            FNC = targetObj.constructor as FuncLike;
            BODY = targetObj as ObjectLike;
        } else {
            throw new Error('NotEvaluatedTargetObjectError');
        }
        // if (typeof FNC !== 'function') {throw new Error('UnknownTargetError');}

        // console.info(decoratorName, args);
        if (!args[1]) {
            this._target = Target.CLASS;
            if (!identifier.forClass) {
                throw new DeveloperException('not.allowed.target', {target: this._target, clazz: FNC.name}).with(this);
            }
        } else {
            if (typeof args[2] === 'number') { // if 3rd argument is number then its index so its parameter decorator
                this._target = Target.PARAMETER;
                if (!identifier.forParameter) {
                    throw new DeveloperException('not.allowed.target', {target: this._target, clazz: FNC.name}).with(this);
                }
                MEMBER_NAME = args[1] as string;
                INDEX = args[2];
                if (!MEMBER_NAME) {
                    throw new DeveloperException('property.name.empty', {target: this._target, clazz: FNC.name}).with(this);
                }
            } else if (args[2] && typeof (args[2] as PropertyDescriptor).value === 'function') { // method decorator
                this._target = Target.METHOD;
                if (!identifier.forMethod) {
                    throw new DeveloperException('not.allowed.target', {target: this._target, clazz: FNC.name}).with(this);
                }
                MEMBER_NAME = args[1] as string;
                METHOD_BODY = (args[2] as PropertyDescriptor).value;
                if (!MEMBER_NAME) {
                    throw new DeveloperException('property.name.empty', {target: this._target, clazz: FNC.name}).with(this);
                }
                if (typeof METHOD_BODY !== 'function') {
                    throw new DeveloperException('method.body.empty', {target: this._target, clazz: FNC.name}).with(this);
                }
            } else { // field decorator, it can be 3rd arg is undefined
                this._target = Target.FIELD;
                if (!identifier.forField) {
                    throw new DeveloperException('not.allowed.target', {target: this._target, clazz: FNC.name}).with(this);
                }
                MEMBER_NAME = args[1] as string;
                if (!MEMBER_NAME) {
                    throw new DeveloperException('property.name.empty', {target: this._target, clazz: FNC.name}).with(this);
                }
            }
        }
        // todo system class
        if ([Target.METHOD, Target.FIELD].includes(this._target)) {
            if (identifier.notStatic && KEYWORD === 'static') {
                throw new DeveloperException('not.used.for.static.member', {target: this._target, clazz: FNC.name}).with(this);
            } else if (identifier.notInstance && KEYWORD === 'instance') {
                throw new DeveloperException('not.used.for.instance.member', {target: this._target, clazz: FNC.name}).with(this);
            }
        }
        switch (this._target) {
            case Target.CLASS:
                this._assigned = InternalReflect.clazz(FNC, BODY, this);
                break;
            case Target.METHOD:
                this._assigned = InternalReflect.clazz(FNC, BODY, this).lyyRegisterProperty(MEMBER_NAME, KEYWORD, 'method', METHOD_BODY);
                break;
            case Target.FIELD:
                this._assigned = InternalReflect.clazz(FNC, BODY, this).lyyRegisterProperty(MEMBER_NAME, KEYWORD, 'field');
                break;
            case Target.PARAMETER:
                this._assigned = InternalReflect.clazz(FNC, BODY, this).lyyRegisterProperty(MEMBER_NAME, KEYWORD, 'method', METHOD_BODY).getParameter(INDEX, {});
                break;
        }
    }

    // region getters
    get identifier(): DecoIdLike {
        return this._identifier;
    }
    get name(): string {
        return this._identifier.name;
    }
    get target(): Target {
        return this._target;
    }
    get assigned(): CoreReflectLike {
        return this._assigned;
    }
    set(value?: RecLike): CoreReflectLike {
        this._assigned.lyyToLastIdentifier(value);
        return this._assigned;
    }

    // endregion getters
    // region is
    isOfClass(): boolean {
        return this._target === Target.CLASS;
    }

    isOfMethod(): boolean {
        return this._target === Target.METHOD;
    }

    isOfField(): boolean {
        return this._target === Target.FIELD;
    }

    isOfParameter(): boolean {
        return this._target === Target.PARAMETER;
    }
    // endregion is
    // region as
    asClass(): ClassReflectLike {
        if (!this.isOfClass()) {
            throw new DeveloperException('invalid.target', {target: this._target, expected: Target.CLASS, description: this._assigned.description}).with(this);
        }
        return this._assigned.lyyInstance(this) as ClassReflectLike;
    }

    asMethod(): PropertyReflectLike {
        if (!this.isOfMethod()) {
            throw new DeveloperException('invalid.target', {target: this._target, expected: Target.METHOD, description: this._assigned.description}).with(this);
        }
        return this._assigned.lyyInstance(this) as PropertyReflectLike;
    }

    asField(): PropertyReflectLike {
        if (!this.isOfField()) {
            throw new DeveloperException('invalid.target', {target: this._target, expected: Target.FIELD, description: this._assigned.description}).with(this);
        }
        return this._assigned.lyyInstance(this) as PropertyReflectLike;
    }

    asParameter(): ParameterReflectLike {
        if (!this.isOfParameter()) {
            throw new DeveloperException('invalid.target', {target: this._target, expected: Target.PARAMETER, description: this._assigned.description}).with(this);
        }
        return this._assigned.lyyInstance(this) as ParameterReflectLike;
    }
    // endregion as

}
