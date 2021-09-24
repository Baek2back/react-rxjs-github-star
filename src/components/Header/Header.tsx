import styles from "@/components/Header/Header.module.scss";
import classNames from "classnames/bind";
import { ChangeEvent, Children, EventHandler } from "react";

const cx = classNames.bind(styles);

interface HeaderProps {
  onChange: EventHandler<ChangeEvent>;
  data: any[];
  current: string;
}

const Header = ({ onChange, data, current }: HeaderProps) => {
  return (
    <header className={cx("Header")}>
      <h1 className={cx("Header__title")}>Gitstar Ranking</h1>
      <span className={cx("Header__description")}>
        Unofficial GitHub star ranking for users, organizations and
        repositories.
      </span>
      <div className={cx("Header__search")}>
        <input
          className={cx("Header__search-input")}
          onChange={onChange}
          placeholder="검색어를 입력해주세요."
          value={current}
        />
        <ul
          className={cx("Header__suggest-list", {
            "Header__suggest-list--disabled": data.length === 0,
          })}
        >
          {Children.toArray(
            data.map(({ login, avatar_url, html_url }) => {
              return (
                <li
                  className={cx("Header__user")}
                  onClick={(event) => {
                    console.log("login", login);
                    console.log(event.target);
                  }}
                >
                  <img
                    src={avatar_url}
                    width="50px"
                    height="50px"
                    alt={login}
                  />
                  <p>
                    <a href={html_url} target="_blank" rel="noreferrer">
                      {login}
                    </a>
                  </p>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;
