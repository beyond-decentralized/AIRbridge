import { QApp } from '@airport/aviation-communication'
import {
  DbEntity,
  DbEntity_LocalId as DbEntityId,
} from '@airport/ground-control';
import { IDvo } from '../definition/IDvo';

/**
 * Data Validation object.
 */
export class Dvo<Entity,
  EntityVDescriptor,
  QSchema extends QApp>
  implements IDvo<Entity, EntityVDescriptor, QSchema> {

  protected dbEntity: DbEntity;

  constructor(
    dbEntityId: DbEntityId | DbEntity,
    public qSchema: QSchema,
  ) {
    if (typeof dbEntityId === 'number') {
      this.dbEntity = qSchema.__dbApplication__.currentVersion[0]
        .applicationVersion.entities[dbEntityId];
    } else {
      this.dbEntity = dbEntityId;
    }
  }

  async validate(
    entity: Entity,
    rules: EntityVDescriptor
  ): Promise<boolean> {
    return null
  }

}
