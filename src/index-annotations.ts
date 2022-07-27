import {leyyo} from "@leyyo/core";
import {reflectPool} from "./reflect-pool";

// region class
export function C(description?: string): ClassDecorator {
    return (target => {
        classId.fork(target).set({description: leyyo.primitive.text(description)});
    });
}
const classId = reflectPool.identify(C, {single: 'description', clazz: true});
// endregion class

// region method
export function M(description?: string): MethodDecorator {
    return ((target, propertyKey, descriptor) => {
        methodId.fork(target, propertyKey, descriptor).set({description: leyyo.primitive.text(description)});
    });
}
const methodId = reflectPool.identify(M, {single: 'description', method: true});
// endregion method

// region property
export function F(description?: string): PropertyDecorator {
    return ((target, propertyKey) => {
        fieldId.fork(target, propertyKey).set({description: leyyo.primitive.text(description)});
    });
}
const fieldId = reflectPool.identify(F, {single: 'description', field: true});
// endregion property

// region property
export function P(name: string, description?: string): ParameterDecorator {
    return ((target, propertyKey, parameterIndex) => {
        parameterId.fork(target, propertyKey, parameterIndex).set({name: leyyo.primitive.text(name), description: leyyo.primitive.text(description)});
    });
}
const parameterId = reflectPool.identify(P, {single: 'name', parameter: true});
// endregion property