import { QApp } from "@airport/aviation-communication";

/**
 * Data Validation Object.
 */
export interface IDvo<Entity,
	EntityVDescritor,
	QSchema extends QApp> {

	qSchema: QSchema

	validate(
		entity: Entity,
		rules: EntityVDescritor
	): Promise<boolean>

}
