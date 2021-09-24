import styles from "@/components/Main/Main.module.scss";
import classNames from "classnames/bind";
import { Children, useMemo } from "react";

const cx = classNames.bind(styles);

interface MainProps {
  loading: boolean;
  data: unknown[];
  currentUserName: string;
}

const Main = ({ loading, data, currentUserName }: MainProps) => {
  const totalRepo = useMemo(() => {
    return data.length;
  }, [data]);

  const { totalStar } = useMemo(() => {
    return data.reduce(
      (ret: { totalStar: number }, value) => {
        return {
          totalStar:
            ret.totalStar +
            (value as { stargazers_count: number })["stargazers_count"],
        };
      },
      { totalStar: 0 }
    );
  }, [data]);

  return (
    <main className={cx("Main")}>
      {loading ? (
        <div>로딩중</div>
      ) : (
        <>
          <div>{currentUserName}</div>
          <div>totalStar: {totalStar}</div>
          <div>totalRepos: {totalRepo}</div>
          <ul>
            {Children.toArray(
              data.map(({ name, stargazers_count }: any) => {
                return (
                  <li className={cx("Main__repo-item")}>
                    <div>{name}</div>
                    <div>{stargazers_count}</div>
                  </li>
                );
              })
            )}
          </ul>
        </>
      )}
    </main>
  );
};

export default Main;
