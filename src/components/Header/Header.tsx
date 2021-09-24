import styles from "@/components/Header/Header.module.scss";
import classNames from "classnames/bind";
import { ChangeEventHandler, Children, useState } from "react";

const cx = classNames.bind(styles);

interface HeaderProps {
  onChange: ChangeEventHandler;
  onClick: (userName: string) => void;
  loading: boolean;
  suggestions: any[];
  currentInput: string;
}

const Header = ({
  onChange,
  onClick,
  loading,
  suggestions,
  currentInput,
}: HeaderProps) => {
  const [disabled, setDisabled] = useState<boolean>(false);
  return (
    <header className={cx("Header")}>
      <h1 className={cx("Header__title")}>Gitstar Ranking</h1>
      <span className={cx("Header__description")}>
        Unofficial GitHub star ranking for users, organizations and
        repositories.
      </span>
      <div className={cx("Header__search")}>
        {loading && (
          <div className={cx("Header__loading")}>
            <i className="fas fa-spinner fa-pluse"></i>
          </div>
        )}
        <input
          className={cx("Header__search-input")}
          onChange={onChange}
          onFocus={() => {
            setDisabled(false);
          }}
          placeholder="검색어를 입력해주세요."
          value={currentInput}
        />
        <ul
          className={cx("Header__suggest-list", {
            "Header__suggest-list--disabled":
              suggestions.length === 0 || disabled,
          })}
        >
          {Children.toArray(
            suggestions.map(({ login, avatar_url, html_url }) => {
              return (
                <li
                  className={cx("Header__user")}
                  onClick={() => {
                    setDisabled(true);
                    onClick(login);
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
