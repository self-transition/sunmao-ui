import { AppModel } from '../../../AppModel/AppModel';
import { BaseBranchOperation } from '../../type';
import { CreateComponentBranchOperation } from '../index';
import { CreateTraitLeafOperation } from '../../leaf';
import { DataSourceType, DATASOURCE_TRAIT_TYPE_MAP } from '../../../constants/dataSource';
import { TSchema } from '@sinclair/typebox';
import {
  parseTypeBox,
  CORE_VERSION,
  CoreComponentName,
} from '@sunmao-ui/shared';

export type CreateDataSourceBranchOperationContext = {
  id: string;
  type: DataSourceType;
  defaultProperties: Record<string, any>;
};

export class CreateDataSourceBranchOperation extends BaseBranchOperation<CreateDataSourceBranchOperationContext> {
  do(prev: AppModel): AppModel {
    const { id, type, defaultProperties = {} } = this.context;
    const traitType = DATASOURCE_TRAIT_TYPE_MAP[type];
    const traitSpec = this.registry.getTraitByType(traitType).spec;
    const initProperties = parseTypeBox(traitSpec.properties as TSchema);

    this.operationStack.insert(
      new CreateComponentBranchOperation(this.registry, {
        componentType: `${CORE_VERSION}/${CoreComponentName.Dummy}`,
        componentId: id,
      })
    );
    this.operationStack.insert(
      new CreateTraitLeafOperation(this.registry, {
        componentId: id,
        traitType,
        properties:
          type === DataSourceType.API
            ? {
                ...initProperties,
                method: 'get',
              }
            : { ...initProperties, ...defaultProperties },
      })
    );

    // do the operation in order
    return this.operationStack.reduce((prev, node) => {
      prev = node.do(prev);
      return prev;
    }, prev);
  }
}
