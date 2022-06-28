import { RuntimeTrait, RuntimeTraitSchema } from '@sunmao-ui/core';
import { UIServices } from './application';
import { RuntimeFunctions } from './component';

export type TraitResult<KStyleSlot extends string, KEvent extends string> = {
  props: {
    data?: unknown;
    customStyle?: Record<KStyleSlot, string>;
    callbackMap?: CallbackMap<KEvent>;
    componentDidUnmount?: Array<() => void>;
    componentDidMount?: Array<() => Function | void>;
    componentDidUpdate?: Array<() => Function | void>;
  } | null;
  unmount?: boolean;
};

export type TraitImpl<TProperties = any> = (
  props: TProperties &
    RuntimeFunctions<unknown, unknown, any> & {
      trait: RuntimeTraitSchema<TProperties>;
      componentId: string;
      services: UIServices;
      evalListItem?: boolean;
      slotProps?: unknown;
    }
) => TraitResult<string, string>;

export type TraitImplFactory<T = any> = () => TraitImpl<T>;

export type ImplementedRuntimeTraitFactory = RuntimeTrait & {
  factory: TraitImplFactory;
};

export type ImplementedRuntimeTrait = ImplementedRuntimeTraitFactory & {
  impl: TraitImpl;
};

export type CallbackMap<K extends string> = Record<K, () => void>;
