import mitt from 'mitt';
import { ComponentSchema } from '@sunmao-ui/core';
import { IOperation } from './operations/type';

export type EventNames = {
  operation: IOperation;
  redo: undefined;
  undo: undefined;
  // when switch app or module, current components refresh
  componentsRefresh: ComponentSchema[];
  // components change by operation
  componentsChange: ComponentSchema[];
  // it is only used for some operations' side effect
  selectComponent: string;
};

const emitter = mitt<EventNames>();

export const eventBus = {
  on: emitter.on,
  off: emitter.off,
  send: emitter.emit,
};
