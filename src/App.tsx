import { Header } from "@/components/Header";
import { Main } from "@/components/Main";
import styles from "@/App.module.scss";
import classNames from "classnames/bind";
import { ChangeEvent, useEffect, useState } from "react";
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  map,
  filter,
  switchMap,
  merge,
  of,
  partition,
  catchError,
  tap,
} from "rxjs";
import { ajax } from "rxjs/ajax";

const cx = classNames.bind(styles);

const subject$ = new BehaviorSubject("");
interface AppState {
  data: unknown[];
  current: string;
  loading: boolean;
  error: string;
}

const App = () => {
  const [state, setState] = useState<AppState>({
    data: [],
    current: "",
    loading: false,
    error: "",
  });

  useEffect(() => {
    const change$ = subject$.pipe(
      tap((s) => setState((prevState) => ({ ...prevState, current: s }))),
      debounceTime(200),
      map((s) => s.trim()),
      distinctUntilChanged()
    );

    const [user$, reset$] = partition(change$, (query) => query.length > 0);

    const userSubscription = user$
      .pipe(
        filter((query) => query.length >= 2),
        switchMap((query) =>
          merge(
            of({ loading: true, data: [], error: "" }),
            ajax.getJSON(`https://api.github.com/search/users?q=${query}`).pipe(
              map((response: any) => {
                return { loading: false, data: response.items, error: "" };
              })
            )
          )
        ),
        catchError((err) => {
          return of({ loading: false, data: [], error: "Error" });
        })
      )
      .subscribe(({ data, loading, error }) => {
        setState((prevState) => ({
          ...prevState,
          data,
          loading,
          error,
        }));
      });

    const resetSubscription = reset$.subscribe(() => {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        data: [],
      }));
    });

    return () => {
      userSubscription.unsubscribe();
      resetSubscription.unsubscribe();
    };
  }, []);

  const onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    subject$.next(value);
  };

  return (
    <section className={cx("App")}>
      <Header onChange={onChange} data={state.data} current={state.current} />
      <Main />
    </section>
  );
};

export default App;
