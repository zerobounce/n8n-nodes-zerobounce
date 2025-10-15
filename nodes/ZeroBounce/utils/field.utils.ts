import { DisplayCondition, INodeProperties, NodeHint, NodeParameterValue } from 'n8n-workflow';
import { Documentation, Fields, Operations } from '../enums';
import { CombineItems } from '../fields/combine-items.field';

export interface IDisplayOptionsShow {
	[key: string]: Array<NodeParameterValue | DisplayCondition> | undefined;
}

/**
 * Appends `displayOptions.show` conditions, e.g. for resource and operation.
 * Deep-clones the original field to avoid mutation.
 */
export function addDisplayOptions(showOption: IDisplayOptionsShow): (f: INodeProperties) => INodeProperties {
	return (f: INodeProperties) => {
		const clone = structuredClone(f);

		return {
			...clone,
			displayOptions: {
				...clone.displayOptions,
				show: {
					...clone.displayOptions?.show,
					...showOption,
				},
			},
		};
	};
}

export function documentationField(name: string, link: Documentation): INodeProperties {
	return {
		displayName: `See <a href="${link}" target="_blank" rel="noopener noreferrer">${name} Documentation</a>`,
		name: Fields.DocumentationNotice,
		type: 'notice',
		default: '',
	};
}

export function documentationHint(operation: Operations, name: string, link: Documentation): NodeHint {
	return {
		message: `See <a href="${link}" target="_blank" rel="noopener noreferrer">${name} Documentation</a>`,
		displayCondition: '={{ $parameter["operation"] === "' + operation + '" }}',
	};
}

export function multipleInputItemsHint(operation: Operations): NodeHint {
	return {
		message: 'There are multiple input items',
		displayCondition: `={{ $parameter["operation"] === "${operation}" && $input.all().length > 1 && $parameter["${CombineItems.name}"] === false }}`,
	};
}

export function combineItemsHint(operation: Operations): NodeHint {
	return {
		message: "Enable 'Combine Items' to combine inputs into a single file.",
		displayCondition: `={{ $parameter["operation"] === "${operation}" && $parameter["${CombineItems.name}"] === false }}`,
	};
}
