import "reflect-metadata";
import {ArraySome, ClassLike, FuncLike} from "@leyyo/core";
import {ReflectionOptionLike} from "./index-types";
import {Fqn} from "@leyyo/fqn";
import {FQN_NAME} from "./internal-component";

@Fqn(...FQN_NAME)
export class ReflectionOption implements ReflectionOptionLike {
    constructor() {
    }
    wrapReflectMetadata(): this {
        // @ts-ignore
        Reflect['decorate'] = (decorators: Array<ClassDecorator | PropertyDecorator | MethodDecorator>, target: Function|ClassLike, targetKey?: PropertyKey, descriptor?: PropertyDescriptor): Function | PropertyDescriptor => {
            return null;
        }
        // function metadata(metadataKey: any, metadataValue: any);
        // set data of an object or property
        Reflect.defineMetadata = (decoId: unknown, decoValue: unknown, clazz: ClassLike|FuncLike, propertyKey?: PropertyKey): void => {
        }
        // check for presence of a metadata key on the prototype chain of an object or property
        Reflect.hasMetadata = (decoId: unknown, clazz: ClassLike|FuncLike, propertyKey?: PropertyKey): boolean => {
            return true;
        }
        Reflect.hasOwnMetadata = (decoId: unknown, clazz: ClassLike|FuncLike, propertyKey?: PropertyKey): boolean => {
            return true;
        }
        // get metadata value of a metadata key on the prototype chain of an object or property
        Reflect.getMetadata = (decoId: unknown, clazz: ClassLike|FuncLike, propertyKey?: PropertyKey): any => {
            return null;
        }
        Reflect.getOwnMetadata = (decoId: unknown, clazz: ClassLike|FuncLike, propertyKey?: PropertyKey): any => {
            return null;
        }
        // get all metadata keys on the prototype chain of an object or property
        Reflect.getMetadataKeys = (clazz: ClassLike|FuncLike, propertyKey?: PropertyKey): ArraySome => {
            return null;
        }
        Reflect.getOwnMetadataKeys = (clazz: ClassLike|FuncLike, propertyKey?: PropertyKey): ArraySome => {
            return null;
        }
        // delete metadata from an object or property
        Reflect.deleteMetadata = (decoId: unknown, clazz: ClassLike|FuncLike, propertyKey?: PropertyKey): boolean => {
            return true;
        }
        return this;
    }
}
export const reflectOption = new ReflectionOption();