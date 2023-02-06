import { ClassDecorator } from '@airport/direction-indicator'
import { PropertyDecorator } from '@airport/direction-indicator';

export const ApiMap = function (
	apiKeyword: string
): ClassDecorator {
	return function (constructor: { new(): Object }) {
		// No runtime logic required.
	}
}

export const Dto = function (
	configuration: Object = null
): ClassDecorator {
	return function (constructor: { new(): Object }) {
		// No runtime logic required.
	}
}

export const DtoSuperclass = function (
	configuration: Object = null
): ClassDecorator {
	return function (constructor: { new(): Object }) {
		// No runtime logic required.
	}
}

export const Key = function (): PropertyDecorator {
	return function (
		targetObject: any,
		propertyKey: string
	) {
		// No runtime logic required.
	}
}

export const Value = function (
	valueConfiguration: any
): PropertyDecorator {
	return function (
		targetObject: any,
		propertyKey: string
	) {
		// No runtime logic required.
	}
}
