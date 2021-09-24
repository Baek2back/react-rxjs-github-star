import { Header } from "@/components/Header";
import { Main } from "@/components/Main";
import styles from "@/App.module.scss";
import classNames from "classnames/bind";
import React, { ChangeEventHandler, useEffect, useState } from "react";
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

const autoCompleteSubject = new BehaviorSubject("");
const userInfoSubject = new BehaviorSubject("");

const initialState: AppState = {
  autoComplete: {
    suggestions: [],
    currentInput: "",
    loading: false,
    error: "",
  },
  userInfo: {
    currentUserName: "",
    data: [],
    loading: false,
    error: "",
  },
};
interface AppState {
  autoComplete: {
    suggestions: unknown[];
    currentInput: string;
    loading: boolean;
    error: string;
  };
  userInfo: {
    currentUserName: string;
    data: unknown[];
    loading: boolean;
    error: string;
  };
}

const App = () => {
  const [{ autoComplete, userInfo }, setState] =
    useState<AppState>(initialState);

  useEffect(() => {
    const userInfoSubscription = userInfoSubject
      .pipe(
        distinctUntilChanged(),
        tap((query) =>
          setState((prevState) => ({
            ...prevState,
            userInfo: {
              ...prevState.userInfo,
              currentUserName: query,
            },
          }))
        ),
        filter((query) => query.length > 1),
        switchMap((query) =>
          merge(
            of({ loading: true, data: [], error: "" }),
            ajax.getJSON(`https://api.github.com/users/${query}/repos`).pipe(
              map((response) => {
                return {
                  loading: false,
                  data: response,
                  error: "",
                };
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
          userInfo: {
            ...prevState.userInfo,
            data: data as unknown[],
            loading,
            error,
          },
        }));
      });

    return () => userInfoSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    const change$ = autoCompleteSubject.pipe(
      tap((s) =>
        setState((prevState) => ({
          ...prevState,
          autoComplete: {
            ...prevState.autoComplete,
            currentInput: s,
          },
        }))
      ),
      debounceTime(200),
      map((s) => s.trim()),
      distinctUntilChanged()
    );

    const [suggestions$, reset$] = partition(
      change$,
      (query) => query.length > 0
    );

    const suggestionsSubscription = suggestions$
      .pipe(
        filter((query) => query.length >= 2),
        switchMap((query) =>
          merge(
            of({ loading: true, suggestions: [], error: "" }),
            ajax.getJSON(`https://api.github.com/search/users?q=${query}`).pipe(
              map((response: any) => {
                return {
                  loading: false,
                  suggestions: response.items,
                  error: "",
                };
              })
            )
          )
        ),
        catchError((err) => {
          return of({ loading: false, suggestions: [], error: "Error" });
        })
      )
      .subscribe(({ suggestions, loading, error }) => {
        setState((prevState) => ({
          ...prevState,
          autoComplete: {
            ...prevState.autoComplete,
            suggestions,
            loading,
            error,
          },
        }));
      });

    const resetSubscription = reset$.subscribe(() => {
      setState((prevState) => ({
        ...prevState,
        autoComplete: {
          ...prevState.autoComplete,
          loading: false,
          suggestions: [],
        },
      }));
    });

    return () => {
      suggestionsSubscription.unsubscribe();
      resetSubscription.unsubscribe();
    };
  }, []);

  const onChange: ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => {
    autoCompleteSubject.next(value);
  };

  const onClick = (userName: string) => {
    userInfoSubject.next(userName);
  };

  return (
    <section className={cx("App")}>
      <Header
        onChange={onChange}
        onClick={onClick}
        loading={autoComplete.loading}
        suggestions={autoComplete.suggestions}
        currentInput={autoComplete.currentInput}
      />
      <Main
        loading={userInfo.loading}
        data={userInfo.data}
        currentUserName={userInfo.currentUserName}
      />
    </section>
  );
};

export default App;
