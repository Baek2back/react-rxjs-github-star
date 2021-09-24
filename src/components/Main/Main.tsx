import styles from "@/components/Main/Main.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const Main = () => {
  return <main className={cx("Main")}>Main</main>;
};

export default Main;
