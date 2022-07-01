import React, { useEffect, useMemo, useRef, useState } from 'react';
import { merge, mergeWith, isArray, omit } from 'lodash';
import { RuntimeTraitSchema } from '@sunmao-ui/core';
import { watch } from '../../../utils/watchReactivity';
import { ImplWrapperProps, TraitResult } from '../../../types';
import { useRuntimeFunctions } from './hooks/useRuntimeFunctions';
import { getSlotElements } from './hooks/useSlotChildren';
import { useGlobalHandlerMap } from './hooks/useGlobalHandlerMap';
import { useEleRef } from './hooks/useEleMap';
import { initStateAndMethod } from '../../../utils/initStateAndMethod';

export const ImplWrapperMain = React.forwardRef<HTMLDivElement, ImplWrapperProps>(
  function ImplWrapperMain(props, ref) {
    const { component: c, children, evalListItem, slotProps } = props;
    const { registry, stateManager } = props.services;

    const Impl = registry.getComponent(c.parsedType.version, c.parsedType.name).impl;

    useGlobalHandlerMap(props);

    // This code is to init dynamic generated components
    // because they have not be initialized before
    if (!stateManager.store[c.id]) {
      initStateAndMethod(registry, stateManager, [c]);
    }

    const { eleRef, onRef } = useEleRef(props);

    const { mergeState, subscribeMethods, executeTrait } = useRuntimeFunctions(props);

    const [traitResults, setTraitResults] = useState<TraitResult<string, string>[]>(
      () => {
        return c.traits.map(t =>
          executeTrait(
            t,
            stateManager.deepEval(t.properties, {
              evalListItem,
              scopeObject: { $slot: slotProps },
              fallbackWhenError: () => undefined,
            })
          )
        );
      }
    );

    useEffect(() => {
      return () => {
        delete stateManager.store[c.id];
      };
    }, [c.id, stateManager.store]);

    // eval traits' properties then execute traits
    useEffect(() => {
      const stops: ReturnType<typeof watch>[] = [];
      const properties: Array<RuntimeTraitSchema['properties']> = [];
      c.traits.forEach((t, i) => {
        const { result, stop } = stateManager.deepEvalAndWatch(
          t.properties,
          ({ result: property }: any) => {
            const traitResult = executeTrait(t, property);
            setTraitResults(oldResults => {
              // assume traits number and order will not change
              const newResults = [...oldResults];
              newResults[i] = traitResult;
              return newResults;
            });
          },
          {
            evalListItem,
            scopeObject: { $slot: slotProps },
            fallbackWhenError: () => undefined,
          }
        );
        stops.push(stop);
        properties.push(result);
      });
      // although traitResults has initialized in useState, it must be set here again
      // because mergeState will be called during the first render of component, and state will change
      setTraitResults(c.traits.map((trait, i) => executeTrait(trait, properties[i])));
      return () => stops.forEach(s => s());
    }, [c.id, c.traits, executeTrait, stateManager, slotProps, evalListItem]);

    // reduce traitResults
    const propsFromTraits: TraitResult<string, string>['props'] = useMemo(() => {
      return Array.from(traitResults.values()).reduce(
        (prevProps, result: TraitResult<string, string>) => {
          if (!result.props) {
            return prevProps;
          }

          return mergeWith({}, prevProps, result.props, (target, src, key) => {
            if (isArray(target)) {
              return target.concat(src);
            } else if (key === 'customStyle') {
              return mergeCustomStyle(target, src);
            }
          });
        },
        {} as TraitResult<string, string>['props']
      );
    }, [traitResults]);

    // component properties
    const [evaledComponentProperties, setEvaledComponentProperties] = useState(() => {
      return merge(
        stateManager.deepEval(c.properties, {
          fallbackWhenError: () => undefined,
          evalListItem,
          scopeObject: { $slot: slotProps },
        }),
        propsFromTraits
      );
    });
    // eval component properties
    useEffect(() => {
      const { result, stop } = stateManager.deepEvalAndWatch(
        c.properties,
        ({ result: newResult }: any) => {
          setEvaledComponentProperties({ ...newResult });
        },
        {
          evalListItem,
          fallbackWhenError: () => undefined,
          scopeObject: { $slot: slotProps },
        }
      );
      // must keep this line, reason is the same as above
      setEvaledComponentProperties({ ...result });

      return stop;
    }, [c.properties, stateManager, slotProps, evalListItem]);

    useEffect(() => {
      const clearFunctions = propsFromTraits?.componentDidMount?.map(e => e());
      return () => {
        clearFunctions?.forEach(func => func && func());
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useDidUpdate(() => {
      const clearFunctions = propsFromTraits?.componentDidUpdate?.map(e => e());
      return () => {
        clearFunctions?.forEach(func => func && func());
      };
    });

    useDidUnmount(() => {
      propsFromTraits?.componentDidUnmount?.forEach(e => e());
    });

    const mergedProps = useMemo(
      () => ({ ...evaledComponentProperties, ...propsFromTraits }),
      [evaledComponentProperties, propsFromTraits]
    );

    const unmount = traitResults.some(result => result.unmount);
    const slotElements = getSlotElements({
      app: props.app,
      childrenMap: props.childrenMap,
      children: props.children,
      component: props.component,
      services: props.services,
      hooks: props.hooks,
      isInModule: props.isInModule,
    });
    const C = unmount ? null : (
      <Impl
        ref={ref}
        key={c.id}
        {...omit(props, 'slotProps')}
        {...mergedProps}
        slotsElements={slotElements}
        mergeState={mergeState}
        subscribeMethods={subscribeMethods}
        elementRef={eleRef}
        getElement={onRef}
      />
    );

    return (
      <React.Fragment key={c.id}>
        {C}
        {children}
      </React.Fragment>
    );
  }
);

// This hook will only run unmount function when unmount, not every time when unmount function changes.
const useDidUnmount = (fn: Function) => {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => fnRef.current(), []);
};

// This hook will run every times when component update, except when first render.
const useDidUpdate = (fn: Function) => {
  const fnRef = useRef(fn);
  const hasMounted = useRef(false);
  fnRef.current = fn;

  useEffect(() => {
    if (hasMounted.current) {
      return fnRef.current();
    } else {
      hasMounted.current = true;
    }
  });
};

function mergeCustomStyle(s1?: Record<string, string>, s2?: Record<string, string>) {
  if (s1 && s2) {
    return mergeWith({}, s1, s2, (target: string, src: string) => {
      if (target && src) {
        return `${target};${src}`;
      }
    });
  }
  return s1 || s2;
}
