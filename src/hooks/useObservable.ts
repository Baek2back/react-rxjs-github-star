import { useLayoutEffect, useState } from "react";
import { Observable } from "rxjs";

export default function useObservable<T>(observable: Observable<T>) {
  const [state, setState] = useState<T>();

  useLayoutEffect(() => {
    const subscription = observable.subscribe(setState);
    return () => subscription.unsubscribe();
  }, [observable]);

  return state;
}
